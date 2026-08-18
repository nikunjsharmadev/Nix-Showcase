import express from 'express';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import cors, { type CorsOptions } from 'cors';
import multer from 'multer';
import { Server } from 'socket.io';
import { Queue, QueueEvents, Worker } from 'bullmq';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
dotenv.config();
//---------------------------------------------------------------------
// CONST
const createConstants = () => {
  const PROCESS = process;
  const ENV = PROCESS.env;
  const PORT: number = Number(ENV['PORT'] || 3000);
  const isDevelopmentEnv: boolean = ENV['TYPE'] === 'dev';
  const HOSTNAME: string = isDevelopmentEnv ? ENV['HOST_DEV']! : ENV['HOST_PROD']!;
  const FRONTEND: string = isDevelopmentEnv ? ENV['FRONTEND_DEV']! : ENV['FRONTEND_PROD']!;
  const UPLOAD_DIR = path.join(PROCESS.cwd(), ENV['UPLOAD_PATH']!);
  const UPLOAD_FIELDS = [
    {
      name: 'images',
      maxCount: Number(ENV['MAX_IMAGE_UPLOAD_COUNT']),
    },
    {
      name: 'videos',
      maxCount: Number(ENV['MAX_VIDEO_UPLOAD_COUNT']),
    },
    {
      name: 'documents',
      maxCount: Number(ENV['MAX_DOCUMENT_UPLOAD_COUNT']),
    },
  ];
  const CHARS_SET = 'abcdefghijklmnopqrstuvwxyz';
  const REDIS_CONNECTION = {
    connection: {
      host: ENV['REDIS_HOST'],
      port: Number(ENV['REDIS_PORT']),
    },
  } as const;
  const CORS_OPTIONS = {
    cors: {
      origin: FRONTEND,
      methods: ['GET', 'POST'],
      credentials: true,
    } as CorsOptions,
  };
  const HTTPS_CERTIFICATE_CONFIG = {
    key: fs.readFileSync(path.join(PROCESS.cwd(), 'certs', 'private.key')),
    cert: fs.readFileSync(path.join(PROCESS.cwd(), 'certs', 'certificate.crt')),
  } as const;
  const SERVER_RUN_MESSAGE = `server is up 🟢🟢🟢 and running 🏃🏃🏃🏃... on: https://${HOSTNAME}:${PORT}`;
  return {
    PROCESS,
    ENV,
    PORT,
    isDevelopmentEnv,
    HOSTNAME,
    UPLOAD_DIR,
    UPLOAD_FIELDS,
    CHARS_SET,
    REDIS_CONNECTION,
    CORS_OPTIONS,
    HTTPS_CERTIFICATE_CONFIG,
    SERVER_RUN_MESSAGE,
  };
};
export const constantFactory = createConstants();

//--------------------------------------------------------------------
// MODELS
// ERROR CUSTOM CLASS
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public success = false,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
  }
}
//---------------------------------------------------------------------
//QUEUES
const createQueue = () => {
  const { REDIS_CONNECTION } = constantFactory;
  let queue: Queue;
  let queueEvents: QueueEvents;
  const setQueue = (queueName: string) => {
    queue = new Queue(queueName, REDIS_CONNECTION);
  };
  const setQueueEvent = (queueName: string) => {
    queueEvents = new QueueEvents(queueName, REDIS_CONNECTION);
  };
  const monitorQueue = async (io: Server) => {
    await queueEvents.waitUntilReady();
    queueEvents.on('progress', async ({ jobId, data }) => {
      const job = await queue.getJob(jobId);
      if (!job) return;
      io.to(job.data.userId).emit('image-progress', {
        data,
      });
    });
    queueEvents.on('completed', async ({ jobId }) => {
      const job = await queue.getJob(jobId);
      if (!job) return;
      io.to(job.data.userId).emit('image-completed', job.returnvalue);
    });
  };
  const getQueue = () => queue;
  const getQueueEvents = () => queueEvents;
  return {
    setQueue,
    getQueue,
    setQueueEvent,
    getQueueEvents,
    monitorQueue,
  };
};
export const queueFactory = createQueue();
//----------------------------------------------------------------------
// WORKERS
const createWorker = () => {
  const { REDIS_CONNECTION, UPLOAD_DIR } = constantFactory;
  let worker: Worker;
  const setWorker = (workerName: string) => {
    console.info(`worker has been started with: ${workerName}`);
    worker = new Worker(
      workerName,
      async (job) => {
        try {
          const { compressImage } = serviceFactory;
          const files = job.data.files;
          await job.updateProgress(10);
          await job.updateProgress(30);
          await fsp.mkdir(UPLOAD_DIR!, { recursive: true });
          const data = await compressImage(files as { images: Express.Multer.File[] });
          await job.updateProgress(60);
          await job.updateProgress(100);
          return data;
        } catch (error) {
          throw error;
        }
      },
      REDIS_CONNECTION,
    );
  };
  const getWorker = () => worker;
  const workerEvents = () => {
    worker.on('completed', (job) => {
      console.info(`Job ${job.id} completed`);
    });
    worker.on('failed', (job, err) => {
      console.info(`Job ${job?.id} failed`, err);
    });
  };
  return { setWorker, getWorker, workerEvents };
};
export const workerFactory = createWorker();
const { setWorker, workerEvents } = workerFactory;
setWorker('image-processing');
workerEvents();
//----------------------------------------------------------------------
// SOCKETS
const createSocket = () => {
  const { CORS_OPTIONS } = constantFactory;
  let socket: Server;
  const setSocket = (apiServer: https.Server) => {
    socket = new Server(apiServer, CORS_OPTIONS);
  };
  const getSocket = () => socket;
  const socketEvents = () => {
    socket.on('connection', (connection) => {
      console.info('client connected: ', connection.id);
      connection.on('join', ({ userId }) => {
        connection.join(userId);
      });
      connection.on('disconnet', (socket) => {
        console.info('client disconnected: ', socket.id);
      });
      connection.on('connection_error', (err) => {
        console.info(err.message);
        console.info(err.context);
      });
    });
  };
  return { getSocket, setSocket, socketEvents };
};
export const socketFactory = createSocket();
//----------------------------------------------------------------------
// UTILS
const createUtils = () => {
  const { UPLOAD_DIR, UPLOAD_FIELDS, CHARS_SET } = constantFactory;
  // CHECK SERVER HEALTH
  const checkAppHealth = (_: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Welcome to CompressImage APIs App',
    });
  };
  // GET RANDOM NAMES
  const getRandomName = (length = 5) => {
    const chars = Array.from({ length }, () => CHARS_SET[Math.floor(Math.random() * CHARS_SET.length)]);
    return makeFirstCharCapital(chars.join(''));
  };
  const makeFirstCharCapital = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  // ERROR HANDLING SERVER
  const handleFatalError = (err: Error) => {
    console.error(err);
    process.exit(1);
  };
  // ERROR HANDLING APIs
  const catchApiError = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ApiError) {
      consoleError(err, req);
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        code: err.statusCode,
      });
    }
    consoleError(err, req);
    return res.status(500).json({
      success: false,
      message: `Internal server error`,
      code: 500,
    });
  };
  const consoleError = (err: unknown, req: Request) => {
    console.error({
      message: err instanceof Error ? err.message : `Internal server error`,
      stack: err instanceof Error ? err.stack : undefined,
      url: req.originalUrl,
      method: req.method,
      error: err,
    });
  };
  // PAGENOTFOUND 404
  const pageNotFound = (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Try with different API endpoint, no url found: '${req.originalUrl}'`,
    });
  };
  // ASYNC ROUTE WRAPPER HANDLER
  const asyncWrapper = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): Promise<void> => {
      return fn(req, res, next).catch(next);
    };
  };
  // LOG RESPONSE PROCESS TIME OF APIS
  const logTime = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const time = Date.now() - start;
      console.info(`${req.method} ${req.originalUrl} took ${time / 1000} seconds ⌛⌛`);
    });
    next();
  };
  // GET MULTER CONFIGS
  const getUploadStorageConfig = () => {
    const destination = function (_: Request, __: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
      cb(null, UPLOAD_DIR);
    };
    const filename = function (_: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
      cb(null, `${Date.now()}-${file.originalname}`);
    };
    const multerDiskstorage = { destination, filename };
    const storage = multer.diskStorage(multerDiskstorage);
    const upload = multer({ storage });
    return upload.fields(UPLOAD_FIELDS);
  };
  return {
    checkAppHealth,
    getRandomName,
    makeFirstCharCapital,
    handleFatalError,
    catchApiError,
    consoleError,
    pageNotFound,
    asyncWrapper,
    logTime,
    getUploadStorageConfig,
  };
};
export const utilFactory = createUtils();
//----------------------------------------------------------------------
// SERVICES
const createServices = () => {
  const { UPLOAD_DIR } = constantFactory;
  const { getRandomName } = utilFactory;
  const compressMultipleFiles = async (files: Express.Multer.File[]) => {
    const allFiles = Object.values(files).filter(Boolean).flat();
    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
    const compressPromises = allFiles.map((file) => {
      return compressSingleFile(file);
    });
    return compressPromises;
  };
  const compressSingleFile = async (file: Express.Multer.File) => {
    const fileName = `${Date.now()}${getRandomName(10)}.webp`;
    const originalSize = file.size;
    const outputPath = path.join(UPLOAD_DIR, fileName);
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(file.path);
      const writeStream = fs.createWriteStream(outputPath);
      const transform = sharp().resize(500).webp({ quality: 60 });
      readStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('finish', async () => {
        const stats = await fs.promises.stat(outputPath);
        const compressedSize = stats.size;
        await fs.promises.unlink(file.path).catch(() => {});
        resolve({
          fileName,
          originalSize,
          compressedSize,
          size: 'bytes',
        });
      });
      readStream.pipe(transform).pipe(writeStream);
    });
  };
  const compressImage = async (files: { images: Express.Multer.File[] }) => {
    if (!files.images?.length) throw new ApiError(400, 'no image uploaded');
    const promiseResponse = files['images'].length > 1 ? await compressMultipleFiles(files.images) : [await compressSingleFile(files['images'][0]!)];
    return Promise.all(promiseResponse);
  };
  return {
    compressMultipleFiles,
    compressSingleFile,
    compressImage,
  };
};
export const serviceFactory = createServices();
//---------------------------------------------------------------------
// CONTROLLER
const createController = () => {
  const compressImage = async (req: Request, res: Response, _: NextFunction): Promise<void> => {
    if (!req.files) throw new ApiError(400, 'no file selected');
    const { getQueue } = queueFactory;
    const job = await getQueue().add('compress-image', {
      files: req.files as { images: Express.Multer.File[] },
      userId: req.body.userId,
    });
    res.status(200).json({
      seccess: true,
      message: 'Image uploaded successfully',
      jobId: job.id,
    });
  };
  return { compressImage };
};
export const controllerFactory = createController();
//----------------------------------------------------------------
// ROUTES
const createRoutes = () => {
  const { getUploadStorageConfig, asyncWrapper } = utilFactory;
  const { compressImage } = controllerFactory;
  const router = express.Router();
  router.route('/image').post(getUploadStorageConfig(), asyncWrapper(compressImage));
  return router;
};
export const routeFactory = createRoutes();
//-----------------------------------------------------------------
// APP
const createApp = () => {
  const { CORS_OPTIONS, UPLOAD_DIR } = constantFactory;
  const { checkAppHealth, logTime, pageNotFound, catchApiError } = utilFactory;
  const app = express();
  app.use(cors(CORS_OPTIONS.cors));
  app.use(logTime);
  app.use(express.json());
  app.get('/api', checkAppHealth);
  app.get('/download/:filename', (req, res) => {
    const filePath = path.join(UPLOAD_DIR, req.params.filename);
    res.download(filePath, 'my-image.jpg');
  });
  app.use('/compressed', express.static(UPLOAD_DIR));
  app.use('/api', routeFactory);
  app.use(pageNotFound);
  app.use(catchApiError);
  return app;
};
export const appFactory = createApp();
//--------------------------------------------------------------------
// SERVER
const ApiServer = async () => {
  try {
    const { HTTPS_CERTIFICATE_CONFIG, PORT, HOSTNAME, SERVER_RUN_MESSAGE } = constantFactory;
    const { setSocket, getSocket, socketEvents } = socketFactory;
    const { setQueue, setQueueEvent, monitorQueue } = queueFactory;
    const server = https.createServer(HTTPS_CERTIFICATE_CONFIG, appFactory);
    setSocket(server);
    socketEvents();
    setQueue('image-processing');
    setQueueEvent('image-processing');
    await monitorQueue(getSocket());
    server.listen(PORT, HOSTNAME, () => console.info(SERVER_RUN_MESSAGE));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
const { handleFatalError } = utilFactory;
process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);
ApiServer().catch(handleFatalError);

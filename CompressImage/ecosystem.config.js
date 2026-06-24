module.exports = {
  apps: [
    {
      name: "Expressjs",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: true, // watch is ON
      ignore_watch: [
        "node_modules",
        "uploads", // <--- ignore upload folder
        "logs",
      ],
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};

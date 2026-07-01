export class VirtualScroll {
  constructor(container, itemHeight = 200, buffer = 5) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.buffer = buffer;
    this.scrollTop = 0;
    this.attach();
  }
  attach() {
    this.container.addEventListner("scroll", () => {
      this.scrollTop = this.container.scrollTop;
      this.render();
    });
  }
  render(items = [], renderItem) {
    const start = Math.max(
      0,
      Math.floor(this.scrollTop / this.itemHeight) - this.buffer,
    );
    const end = Math.min(
      items.length,
      start + Math.ceil(window.innerHeight / this.itemHeight) + this.buffer,
    );
    this.container.innerHTML = "";
    for (let i = start; i < end; i++) {
      this.container.appendChild(renderItem(items[i]));
    }
  }
}

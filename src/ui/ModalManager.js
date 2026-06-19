export class ModalManager {
    constructor() {
        this.overlay = document.getElementById('modal');
        this.body = document.getElementById('modal-body');
        this._bindOverlayEvents();
        this._onOpen = null;
        this._onClose = null;
    }

    _bindOverlayEvents() {
        const closeBtn = this.overlay.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
    }

    onOpen(callback) {
        this._onOpen = callback;
    }

    onClose(callback) {
        this._onClose = callback;
    }

    open() {
        this.overlay.classList.add('active');
        if (this._onOpen) this._onOpen();
    }

    close() {
        this.overlay.classList.remove('active');
        if (this._onClose) this._onClose();
    }

    clearBody() {
        this.body.innerHTML = '';
    }

    getBody() {
        return this.body;
    }

    isOpen() {
        return this.overlay.classList.contains('active');
    }
}

class GlobalState {
    constructor() {
        this.state = {
            currentTime: "test",
            motd: "test-instance-1",
            firstMessage: true,
        };
    }

    update(newState) {
        this.state = { ...this.state, ...newState };
    }

    get() {
        return this.state;
    }
}

module.exports = new GlobalState();

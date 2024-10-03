const Twitter = require("./environments/twitter");
const Exo = require("./environments/exo");
const MemeMagic = require("./environments/meme_magic");
const Search = require("./environments/search");
const Sydney = require("./environments/sydney");

class EnvironmentRegistry {
    constructor() {
        this.environments = {
            twitter: new Twitter(),
            exo: new Exo(),
            meme: new MemeMagic(),
            search: new Search(),
            sydney: new Sydney(),
        };
    }

    getEnvironment(name) {
        return this.environments[name.toLowerCase()];
    }

    getEnvironmentNames() {
        return Object.keys(this.environments);
    }

    getAllCommands() {
        console.log("getting all valid commands");
        const commands = {};
        for (const [envName, env] of Object.entries(this.environments)) {
            commands[envName] = env.getCommands();
        }
        return commands;
    }
}

module.exports = EnvironmentRegistry;

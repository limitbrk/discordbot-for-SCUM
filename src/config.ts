import * as dotenv from 'dotenv';
import { ConfigUtils } from './utils';
dotenv.config();

const config = {
    APP: {
        PORT: 8080
    },
    SERVER: {
        BATTLEMETRIC_ID: "34924241"
    },
    DISCORD: {
        NAME: "Happy Bot",
        TOKEN: "example-discord-token",
        CLIENT_ID: "example-discord-client-id"
    },
    REPO: {
        STEAM: {
            TOKEN: "example-steam-token"
        },
        MONGO: {
            // Future Update
        },
    },
    SETTING: {
        REGISTER: {
            RULE_CODE: "1150",
            WAITTIME: 300_000,
            RULES: {
                TH: ["1068573143272280102", "1016728734260281385", "1096792078450692166", "1022501985087401996"],
                EN: ["1106431261725175969"],
            },
            ASSIGN_ROLES:{
                TH: ["1016350933296349227"],
                EN: ["1016350933296349227", "1106429503607160864"],
            },
            STARTER_ROOM: ["1016360910656389150","1016608862780002344"]
        }
    },
}

const mergedConfig = ConfigUtils.mergeEnvWithConfig(config, process.env);
export default mergedConfig;
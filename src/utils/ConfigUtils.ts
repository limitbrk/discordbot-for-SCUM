import { logger } from "../Logger";
import { StringUtils } from "./StringUtils";


export class ConfigUtils {
    private static isNumberRegex = new RegExp(/^([0-9]+)(\.)?([0-9]+)?$/)

    public static mergeEnvWithConfig(config: Record<string, any>, env: any, prefix = ''): Record<string, any> {
        const mergedConfig: Record<string, any> = {};
    
        for (const key in config) {
            const envKey = (prefix ? prefix + '_' : '') + key;
            const envVal = env[envKey]
    
            switch (typeof config[key]) {
                case 'object':
                    if (Array.isArray(config[key])) {
                        try {
                            if (StringUtils.isEmpty(envVal)){
                                mergedConfig[key] = config[key];
                                break;
                            }
                            const newArr = JSON.parse(envVal);
                            if (typeof newArr  === 'object' && Array.isArray(newArr)){
                                mergedConfig[key] = newArr;
                            }
                        } catch (e) {
                            logger.error(`Can\'t parse value of ${envKey} :`, e)
                        }
                    } else if (config[key] !== null) {
                        mergedConfig[key] = this.mergeEnvWithConfig(config[key], env, envKey);
                    }
                    break;
                case 'boolean':
                    mergedConfig[key] = envVal ? envVal === 'true' : config[key];
                    break;
                case 'number':
                    mergedConfig[key] = !StringUtils.isEmpty(envVal) && this.isNumberRegex.test(envVal) ? envVal : config[key];
                    break;
                case 'string':
                    mergedConfig[key] = envVal || config[key];
                    break;
                default:
                    logger.warn('Detect new Typeof ' + envKey)
                    break;
            }
        }
    
        return mergedConfig;
    }
}
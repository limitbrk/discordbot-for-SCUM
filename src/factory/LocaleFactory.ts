import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import { join } from 'path'
import { readdirSync, lstatSync } from 'fs'
import { logger } from '../Logger'

const localesFolder = join(__dirname, '../locales')

export class LocaleFactory {
  public static load() {
    i18next
      .use(Backend)
      .init({
        initImmediate: false, // setting initImediate to false, will load the resources synchronously
        fallbackLng: 'en',
        ns: ['error','register'],
        preload: readdirSync(localesFolder).filter((fileName) => {
          const joinedPath = join(localesFolder, fileName)
          return lstatSync(joinedPath).isDirectory()
        }),
        backend: {
          loadPath: join(localesFolder, '{{lng}}/{{ns}}.json')
        }
      }, (err) => {
        if (err) {
          logger.error(err);
        } else {
          logger.info("Load locale completed");
        }
      })
  }
}
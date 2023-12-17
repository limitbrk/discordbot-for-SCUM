# SCUM discord bot

## Prepare Modules
install poetry
```bash
$ curl -sSL https://install.python-poetry.org | python3 -
```
install modules
```bash
$ poetry install
```

## Prepare Translation
1. generate pot file
```bash
$ pybabel extract {targetFile} -o locales/{domain}.pot
```
2. generate po file foreach language
```bash
$ pybabel init -l {lang} -D {domain} -i locales/{domain}.pot -d locales
$ pybabel update -D {domain} -i locales/{domain}.pot -d locales
```
get lang by `$ pybabel --list-locales`

3. generate mo
```bash
$ pybabel compile -D {domain} -d locales
```

## Start service
```bash
$ python main.py
```

install:
	npm ci

link:
	npm link

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

publish:
	npm publish --dry-run

run:
	./bin/page-loader.js --output /var/tmp https://yandex.ru

debug:
	DEBUG=page-loader ./bin/page-loader.js https://yandex.ru
### Hexlet tests and linter status:
[![Actions Status](https://github.com/nic11371/fullstack-javascript-project-4/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/nic11371/fullstack-javascript-project-4/actions)

# Page Loader

A command-line utility that downloads a page from the web and saves it locally. It downloads the main HTML file and local assets (images, styles, scripts) to a specified directory.

## Requirements

- Node.js

## Installation

1. Clone the repository:

```bash
git clone https://github.com/nic11371/fullstack-javascript-project-4.git
cd fullstack-javascript-project-4
```

2. Install dependencies:

```bash
make install
```

3. Link the package globally (optional):

```bash
npm link
```

## Usage

```bash
page-loader [options] <url>
```

### Options

- `-V, --version`        Output the version number.
- `-o, --output [dir]`   Output directory (default: current working directory).
- `-h, --help`           Display help for command.

### Example

```bash
page-loader --output /var/tmp https://yandex.ru
```

## Development

### Running Tests

```bash
make test
```

### Linting

```bash
make lint
```

## Debugging

This project uses the `debug` library. To enable debug logs, set the `DEBUG` environment variable:

```bash
DEBUG=page-loader page-loader https://ru.hexlet.io/courses
```

To see logs from `axios` (HTTP client):

```bash
DEBUG=axios page-loader https://ru.hexlet.io/courses
```
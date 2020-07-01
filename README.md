# D3 Message Board

D3 Message Board is message board plugin powered by D3.js.

You can load image into canvas, And you can add any messages into specified area.

`canvas` element has not used. This plugin has implemented with the svg element.

## Demo

<img src="https://github.com/1105-6601/d3-message-board/blob/master/demo/demo.gif?raw=true" width="500px">

## Installation

```
npm i d3-message-board --save
```

## Basic usage

```typescript
import { Board, newConfiguration } from 'd3-message-board';

// Make new configuration
const configuration = newConfiguration();

// Set background image url
configuration.canvas.backgroundImageUrl = 'https://picsum.photos/400/350';

const messageBoard = new Board(configuration);

messageBoard.init();
```

## Export configuration

```typescript
// Get current board configuration as json string.
const exported = messageBoard.exportConfiguration();
```

## Load configuration

```typescript
import { Board, loadConfiguration } from 'd3-message-board';

// Restore configuration from json string
const configuration = loadConfiguration(exported);

const messageBoard = new Board(configuration);

messageBoard.init();
```

## Use Case

### Readonly

```typescript
configuration.canvas.readOnly = true;
```

- Default is false

### Canvas size auto resizing depending on the specified image size

```typescript
configuration.canvas.autoResize = true;

// Set max and min size 
configuration.canvas.minWidth  = 400;
configuration.canvas.minHeight = 400;
configuration.canvas.maxWidth  = 600;
configuration.canvas.maxHeight = 800;
```

- Default is true

### Rectangle animation

```typescript
// Enable
configuration.canvas.rectAnimation = true;

// Disable
configuration.canvas.rectAnimation = false;
```

- Default is true

### Background grid

```typescript
// Enable
configuration.canvas.showGrid = true;

// Disable
configuration.canvas.showGrid = false;
```

- Default is true

```typescript
// Set grid size
configuration.canvas.gridSize = 50;
```

- Default is 30

### Change coloring candidates

```typescript
configuration.input.colors = [
  '#yourOwnColorCodeHere',
  '...',
  '...',
  '...',
  '...',
]
```

Default coloring candidates

```typescript
[
  '#f48fb1',
  '#ce93d8',
  '#90caf9',
  '#80deea',
  '#a5d6a7',
  '#e6ee9c',
  '#ffe082',
  '#ffab91',
  '#bcaaa4',
  '#b0bec5'
]
```

### Others

Various other customizations are possible. See the `dist/src/index.d.ts` file.

import * as d3                     from 'd3';
import { Selection }               from 'd3';
import { Rectangle, newRectangle } from './structure/rectangle';
import { Configuration }           from './structure/configuration';
import { Offset }                  from './structure/offset';
import { Size }                    from './structure/size';
import { Coordinate }              from './structure/coordinate';

export class Board
{
  private readonly config: Configuration;

  private svg: Selection<any, any, any, any>;

  private dragging: boolean = false;

  private dragStartX: number;

  private dragStartY: number;

  private editing: boolean = false;

  private currentTemporaryRectangle: Rectangle;

  private currentFixedBalloonId: string;

  public constructor(config: Configuration)
  {
    this.config = config;
  }

  public async init(): Promise<void>
  {
    await this.initMainCanvas();

    this.initInputUI();
    this.initRectangles();
    this.initGlobalEvents();
  }

  public exportConfiguration(): string
  {
    return JSON.stringify(this.config);
  }

  private async initMainCanvas()
  {
    if (
      this.config.canvas.autoResize &&
      this.config.canvas.backgroundImageUrl &&
      !this.config.canvas.readOnly
    ) {
      // Calculate canvas size from bg image
      const imageSize  = await this.getRemoteImageSize(this.config.canvas.backgroundImageUrl);
      const canvasSize = this.calculateCanvasSize(imageSize);

      this.config.canvas.width  = canvasSize.width;
      this.config.canvas.height = canvasSize.height;
    }

    /**
     * Create main canvas
     */
    this.svg = d3
      .select(this.config.canvas.selector)
      .append('svg')
      .attr('width', this.config.canvas.width)
      .attr('height', this.config.canvas.height)
      .attr('class', 'd3-message-board')
      .attr('overflow', 'visible');

    if (this.config.canvas.showGrid) {
      this.makeGridLines();
    } else {
      this.svg.style('background', this.config.canvas.backgroundColor)
    }

    // Area for background image
    this.svg
      .append('g')
      .attr('class', 'bg')
      .append('image')
      .attr('width', this.config.canvas.width)
      .attr('height', this.config.canvas.height)
      .attr('xlink:href', this.config.canvas.backgroundImageUrl);

    // Area for dragging
    this.svg
      .append('g')
      .attr('class', 'drag')
      .append('rect')
      .attr('width', this.config.canvas.width)
      .attr('height', this.config.canvas.height)
      .attr('fill', 'white')
      .attr('fill-opacity', 0);

    // Area for main rects
    this.svg
      .append('g')
      .attr('class', 'rects');

    // Area for temporary rects
    this.svg
      .append('g')
      .attr('class', 'draw');

    // Area for input UIs
    this.svg
      .append('g')
      .attr('class', 'input');

    if (!this.config.canvas.readOnly) {
      this.bindEventsForEdit();
    }
  }

  private calculateCanvasSize(imageSize: Size): Size
  {
    const desiredSize: Size = {
      width:  imageSize.width,
      height: imageSize.height,
    };

    if (desiredSize.width > this.config.canvas.maxWidth) {
      desiredSize.width = this.config.canvas.maxWidth;
    }

    if (desiredSize.height > this.config.canvas.maxHeight) {
      desiredSize.height = this.config.canvas.maxHeight;
    }

    if (desiredSize.width < this.config.canvas.minWidth) {
      desiredSize.width = this.config.canvas.minWidth;
    }

    if (desiredSize.height < this.config.canvas.minHeight) {
      desiredSize.height = this.config.canvas.minHeight;
    }

    return desiredSize;
  }

  private makeGridLines(): void
  {
    const horizontalLines = `
    repeating-linear-gradient(
                    0deg,
                    #ccc,
                    #ccc 1px,
                    transparent 1px,
                    transparent 100%
    )
    `;

    const verticalLines = `
    repeating-linear-gradient(
                    90deg,
                    #ccc,
                    #ccc 1px,
                    ${this.config.canvas.backgroundColor} 1px,
                    ${this.config.canvas.backgroundColor} 100%
    )
    `;

    const grid     = `${horizontalLines},${verticalLines}`;
    const gridSize = this.config.canvas.gridSize;

    this.svg
      .style('background-image', grid)
      .style('background-size', `${gridSize}px ${gridSize}px`);
  }

  private bindEventsForEdit(): void
  {
    this.svg
      .select('g.drag')
      .call(d3
        .drag()
        .on('start', () => {

          if (this.editing || this.config.canvas.readOnly) {
            return true;
          }

          const target = d3.event.sourceEvent.target;
          if (!target.parentElement.classList.contains('drag')) {
            return;
          }

          this.dragging = true;

          this.dragStartX = d3.event.x;
          this.dragStartY = d3.event.y;

          this.svg
            .select('g.draw')
            .append('rect')
            .attr('x', this.dragStartX)
            .attr('y', this.dragStartY)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('fill', 'white')
            .attr('fill-opacity', 0)
            .attr('stroke', this.config.draw.borderColor)
            .attr('stroke-width', this.config.draw.borderWidth)
            .attr('stroke-dasharray', 3)
            .attr('id', 'drawing');
        })
        .on('drag', () => {

          if (!this.dragging || this.editing) {
            return;
          }

          const width  = d3.event.x - this.dragStartX;
          const height = d3.event.y - this.dragStartY;
          const target = this.svg
            .select(`#drawing`)
            .attr('width', Math.abs(width))
            .attr('height', Math.abs(height));

          if (width < 0) {
            target.attr('x', this.dragStartX + width);
          }

          if (height < 0) {
            target.attr('y', this.dragStartY + height);
          }
        })
        .on('end', () => {

          if (!this.dragging || this.editing) {
            return;
          }

          this.dragging = false;
          this.editing  = true;

          const target = this.svg.select(`#drawing`);
          const x      = +target.attr('x');
          const y      = +target.attr('y');
          const width  = +target.attr('width');
          const height = +target.attr('height');

          const rect = newRectangle({
            leftTop:     {x, y},
            rightBottom: {
              x: x + width,
              y: y + height,
            },
          });

          // If area of rectangles under 500, cancel processing.
          if (rect.getArea() < 500) {
            this.cleanUpInputState();
            return;
          }

          // Show input UI
          const topRight = rect.getSpecialCoordinate('top-right');

          const inputUIRectPosition: Coordinate = {
            x: topRight.x + this.config.input.margin,
            y: topRight.y,
          };

          // Detect right and bottom of presentation area
          const safeArea = this.getWindowSafeArea();
          const svgRect  = this.getAbsoluteRect(this.svg.node());

          const inputAreaBottomRight: Coordinate = {
            x: svgRect.x + topRight.x + this.config.input.margin + this.config.input.width,
            y: svgRect.y + topRight.y + this.config.input.height,
          };

          if (safeArea.x < inputAreaBottomRight.x) {
            const diff = inputAreaBottomRight.x - safeArea.x;
            inputUIRectPosition.x -= diff;
          }

          if (safeArea.y < inputAreaBottomRight.y) {
            const diff = inputAreaBottomRight.y - safeArea.y;
            inputUIRectPosition.y -= diff;
          }

          const inputUIRectGroup = this.svg
            .select('g.input')
            .style('display', 'block');

          inputUIRectGroup
            .select('rect')
            .attr('x', inputUIRectPosition.x)
            .attr('y', inputUIRectPosition.y);

          inputUIRectGroup
            .select('foreignObject')
            .attr('x', inputUIRectPosition.x)
            .attr('y', inputUIRectPosition.y);

          // Focus to textarea
          const textArea = <HTMLTextAreaElement>this.svg
            .select('g.input textarea')
            .node();

          textArea.focus();
          textArea.value = this.config.message.textAreaPlaceholder;

          this.currentTemporaryRectangle = rect;
        })
      );
  }

  private getAbsoluteRect(target: HTMLElement): Coordinate
  {
    const rect = target.getBoundingClientRect();

    return {
      x: rect.x + window.scrollX,
      y: rect.y + window.scrollY,
    }
  }

  private initInputUI()
  {
    /**
     * Render input UIs
     */
    const inputUIRectGroup = this.svg
      .select('g.input')
      .style('display', 'none')
    ;

    inputUIRectGroup
      .append('rect')
      .attr('width', this.config.input.width)
      .attr('height', this.config.input.height)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', 'white')
      .attr('fill-opacity', 1)
      .attr('stroke', this.config.input.borderColor)
      .attr('stroke-width', this.config.input.borderWidth)
    ;

    inputUIRectGroup
      .append('foreignObject')
      .attr('width', this.config.input.width)
      .attr('height', this.config.input.height)
      .append('xhtml:body')
      .style('height', `${this.config.input.height}px`)
      .html(this.getInputUITemplate())
      .on('keyup', () => {
        if (d3.event.key === 'Escape') {
          if (this.editing) {
            this.cleanUpInputState();
          }
        }
      });

    // Change color function
    inputUIRectGroup
      .selectAll('.color')
      .on('click', () => {
        const target    = d3.event.target;
        const colorCode = target.dataset['cc'];

        inputUIRectGroup
          .selectAll('.color')
          .classed('active', false);

        target.classList.add('active');

        // Apply color to tmp rect
        this.svg
          .select(`#drawing`)
          .attr('stroke', colorCode);

        this.currentTemporaryRectangle.colorCode = colorCode;
      });

    // On confirm
    inputUIRectGroup
      .select('.btn-confirm')
      .on('click', () => {

        const textArea = <HTMLTextAreaElement>inputUIRectGroup
          .select('textarea')
          .node();

        // Create new rectangle
        this.config.rectangles.push({
          figure: this.currentTemporaryRectangle,
          text:   {
            value: textArea.value,
          }
        });

        this.currentTemporaryRectangle = null;

        // Re-initialization
        this.initRectangles();
        this.cleanUpInputState();
      });

    // On cancel
    inputUIRectGroup
      .select('.btn-cancel')
      .on('click', () => {
        this.cleanUpInputState();
      });
  }

  private cleanUpInputState(): void
  {
    // Delete tmp drawing rect
    this.svg
      .select(`#drawing`)
      .remove();

    // Hide input UI
    this.svg
      .select('g.input')
      .style('display', 'none');

    // Clean up textarea value
    const textArea = <HTMLTextAreaElement>this.svg
      .select('g.input textarea')
      .node();

    textArea.value = null;

    // Unselect rectangle color
    this.svg
      .selectAll('g.input .color')
      .classed('active', false);

    // Revert editing flag
    this.editing = false;
  }

  private initRectangles(): void
  {
    /**
     * Clean up elements
     */
    this.svg
      .select('g.rects')
      .selectAll('*')
      .remove();

    /**
     * Render comment rectangles
     */
    const commentRectGroup = this.svg
      .select('g.rects')
      .selectAll()
      .data(this.config.rectangles.filter(d => d.text.value))
      .enter()
      .append('g')
      .attr('id', d => newRectangle(d.figure).id)
      .attr('data-color', d => d.figure.colorCode || this.config.balloon.borderColor)
      .attr('class', 'comment')
      .style('display', 'none')
    ;

    const commentRect = (rect: Rectangle) => {
      return newRectangle(rect).getPositionedRectangle('right', this.config.balloon.margin, this.config.balloon.size)
    };

    // Container rect
    commentRectGroup
      .append('rect')
      .attr('x', d => commentRect(d.figure).x)
      .attr('y', d => commentRect(d.figure).y)
      .attr('width', d => commentRect(d.figure).calculateSize(this.config.balloon.size, this.config.balloon.autoResize, d.text.value.length).width)
      .attr('height', d => commentRect(d.figure).calculateSize(this.config.balloon.size, this.config.balloon.autoResize, d.text.value.length).height)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', 'white')
      .attr('fill-opacity', 1)
      .attr('stroke', d => d.figure.colorCode || this.config.balloon.borderColor)
      .attr('stroke-width', this.config.balloon.borderWidth)
      .attr('class', 'comment')
    ;

    // Left Arrow
    commentRectGroup
      .append('polygon')
      .attr('class', 'arrow-left')
      .attr('opacity', 0)
      .attr('fill', d => d.figure.colorCode || this.config.balloon.borderColor)
      .attr('points', d => commentRect(d.figure)
        .calculateSize(this.config.balloon.size, this.config.balloon.autoResize, d.text.value.length)
        .getArrowPolygonPoints('left-top', this.config.balloon.arrowSize))
    ;

    // Right Arrow
    commentRectGroup
      .append('polygon')
      .attr('class', 'arrow-right')
      .attr('opacity', 0)
      .attr('fill', d => d.figure.colorCode || this.config.balloon.borderColor)
      .attr('points', d => commentRect(d.figure)
        .calculateSize(this.config.balloon.size, this.config.balloon.autoResize, d.text.value.length)
        .getArrowPolygonPoints('right-top', this.config.balloon.arrowSize))
    ;

    // Text
    commentRectGroup
      .append('foreignObject')
      .attr('x', d => commentRect(d.figure).x)
      .attr('y', d => commentRect(d.figure).y)
      .attr('width', d => commentRect(d.figure).calculateSize(this.config.balloon.size, this.config.balloon.autoResize, d.text.value.length).width)
      .attr('height', d => commentRect(d.figure).calculateSize(this.config.balloon.size, this.config.balloon.autoResize, d.text.value.length).height)
      .append('xhtml:body')
      .html(d => {
        const rect = commentRect(d.figure).calculateSize(this.config.balloon.size, this.config.balloon.autoResize, d.text.value.length);
        return `<textarea style="width: ${rect.width - 5}px; height: ${rect.height - 5}px">${d.text.value}</textarea>`;
      })
    ;

    /**
     * Render highlight rectangles
     */
    const highlights = this.svg
      .select('g.rects')
      .selectAll()
      .data(this.config.rectangles)
      .enter()
      .append('rect');

    highlights
      .classed('highlight', true)
      .attr('x', d => newRectangle(d.figure).x)
      .attr('y', d => newRectangle(d.figure).y)
      .attr('width', d => newRectangle(d.figure).width)
      .attr('height', d => newRectangle(d.figure).height)
      .attr('data-id', d => newRectangle(d.figure).id)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', 'white')
      .attr('fill-opacity', 0)
      .attr('stroke', d => d.figure.colorCode || this.config.canvas.defaultRectColor)
      .attr('stroke-width', 5)
      .attr('stroke-opacity', this.config.canvas.defaultRectOpacity)
      .on('click', (d) => {

        if (!d.text.value) {
          return;
        }

        const id = newRectangle(d.figure).id;
        this.changeCommentBalloonAppearance(id);
        setTimeout(() => {
          const target               = this.svg.select(`#${id}`);
          this.currentFixedBalloonId = target.classed('fixed') ? id : null;
        });
      })
      .on('mouseover', (d) => {

        if (!d.text.value) {
          return;
        }

        const id = newRectangle(d.figure).id;

        const isFixed = this.svg
          .select(`#${id}`)
          .classed('fixed');

        if (isFixed) {
          return;
        }

        const cRect = commentRect(d.figure).calculateSize(this.config.balloon.size, this.config.balloon.autoResize, d.text.value.length);

        // Tweak comment rect position
        const balloon     = this.svg.select(`#${id}`);
        const balloonRect = this.getAbsoluteRect(<HTMLElement>balloon.node());

        const balloonRectBottomRight: Coordinate = {
          x: balloonRect.x + cRect.width + this.config.balloon.arrowSize,
          y: balloonRect.y + cRect.height,
        };

        const safeArea = this.getWindowSafeArea();

        let translateX     = 0;
        let translateY     = 0;
        let arrowDirection = 'left';
        if (safeArea.x < balloonRectBottomRight.x) {
          arrowDirection = 'right';
          translateX     = newRectangle(d.figure).width + cRect.width + (this.config.balloon.margin * 2);
        }

        if (safeArea.y + window.scrollY < balloonRectBottomRight.y) {
          translateY = balloonRectBottomRight.y - (safeArea.y + window.scrollY);
        }

        // Toggle arrow display state
        switch (arrowDirection) {
          case 'left':
            balloon.select('.arrow-left').attr('opacity', 1);
            balloon.select('.arrow-right').attr('opacity', 0);
            break;
          case 'right':
            balloon.select('.arrow-left').attr('opacity', 0);
            balloon.select('.arrow-right').attr('opacity', 1);
            break;
        }

        // Apply frame position
        balloon.style('transform', `translate(-${translateX}px, -${translateY}px)`);

        // Apply arrow position
        balloon
          .selectAll('polygon')
          .style('transform', `translateY(${translateY}px)`);

        // Show comment rect
        this.svg
          .select(`#${id}`)
          .raise()
          .style('display', 'block')
          .transition()
          .duration(300)
          .attr('opacity', 1);
      })
      .on('mouseout', (d) => {

        if (!d.text.value) {
          return;
        }

        const id = newRectangle(d.figure).id;

        const isFixed = this.svg
          .select(`#${id}`)
          .classed('fixed');

        if (isFixed) {
          return;
        }

        // Hide comment rect
        this.svg
          .select(`#${id}`)
          .attr('opacity', 0)
          .style('display', 'none')
          .lower();
      });

    if (this.config.canvas.rectAnimation) {
      // Apply rect animation
      highlights
        .classed('animate', true)
        .attr('stroke-dasharray', this.config.canvas.rectAnimationDashArray)
        .attr('stroke-dashoffset', 0);
    }

    if (!this.config.canvas.readOnly) {
      this.initCloseIcon();
    }
  }

  private changeCommentBalloonAppearance(commentGroupId: string, toBe?: boolean): void
  {
    const target = this.svg.select(`#${commentGroupId}`);
    const state  = typeof toBe !== 'undefined' ? toBe : !target.classed('fixed');

    // Change fixed state
    target.classed('fixed', state);

    // Change appearance
    // Frame
    target
      .select('rect')
      .attr('stroke', target.classed('fixed') ? this.config.balloon.highlightColor : target.attr('data-color'));
    // Arrows
    target
      .selectAll('polygon')
      .attr('fill', target.classed('fixed') ? this.config.balloon.highlightColor : target.attr('data-color'));
  }

  private initCloseIcon(): void
  {
    // Close icon
    const iconGroup = this.svg
      .select('g.rects')
      .selectAll()
      .data(this.config.rectangles)
      .enter()
      .append('g')
      .attr('class', 'close-icon')
      .on('click', (d) => {
        const idx = this.config.rectangles.indexOf(d);
        if (idx === -1) {
          return;
        }

        if (!confirm(this.config.message.deleteConfirmationText)) {
          return;
        }

        this.config.rectangles.splice(idx, 1);
        this.initRectangles();
      });

    const iconOffset: Offset = {
      x: 14,
      y: 6
    };

    const iconSize: Size = {
      width:  20,
      height: 20,
    };

    // Icon outline
    iconGroup
      .append('rect')
      .attr('x', d => newRectangle(d.figure).getSpecialCoordinate('top-right').x - iconOffset.x)
      .attr('y', d => newRectangle(d.figure).getSpecialCoordinate('top-right').y - iconOffset.y)
      .attr('width', iconSize.width)
      .attr('height', iconSize.height)
      .attr('rx', iconSize.width / 2)
      .attr('ry', iconSize.height / 2)
      .attr('fill', 'white')
      .attr('fill-opacity', 0)
      .attr('stroke', d => d.figure.colorCode || this.config.canvas.defaultRectColor)
      .attr('stroke-width', 5)
      .attr('stroke-opacity', this.config.canvas.defaultRectOpacity)
    ;

    // Icon bg
    iconGroup
      .append('rect')
      .attr('x', d => newRectangle(d.figure).getSpecialCoordinate('top-right').x - iconOffset.x)
      .attr('y', d => newRectangle(d.figure).getSpecialCoordinate('top-right').y - iconOffset.y)
      .attr('width', iconSize.width)
      .attr('height', iconSize.height)
      .attr('rx', iconSize.width / 2)
      .attr('ry', iconSize.height / 2)
      .attr('fill', 'white')
      .attr('fill-opacity', 1)
    ;

    iconGroup
      .append('foreignObject')
      .attr('x', d => newRectangle(d.figure).getSpecialCoordinate('top-right').x - iconOffset.x)
      .attr('y', d => newRectangle(d.figure).getSpecialCoordinate('top-right').y - iconOffset.y)
      .attr('width', iconSize.width)
      .attr('height', iconSize.height)
      .append('xhtml:body')
      .html(`<span class="times" style="line-height: ${iconSize.height}px">&times;</span>`)
    ;
  }

  private initGlobalEvents(): void
  {
    // Initialize behavior of balloon display
    window.addEventListener('click', (e) => {
      const target              = <HTMLElement>e.target;
      const fixedBalloonTouched = this.closest(target, '.fixed');
      if (fixedBalloonTouched) {
        return;
      }

      const rectId                      = target.matches('rect.highlight') ? target.dataset['id'] : null;
      const relatedHighlightRectTouched = this.currentFixedBalloonId === rectId;

      if (!this.currentFixedBalloonId || relatedHighlightRectTouched) {
        return;
      }

      // Close all balloon
      this.svg
        .selectAll(`g.rects g.comment:not(#${rectId})`)
        .classed('fixed', false)
        .attr('opacity', 0)
        .style('display', 'none')
        .lower()
      ;

      this.svg
        .selectAll('g.rects g.comment')
        .nodes()
        .forEach((element: HTMLElement) => {
          if (element.id === rectId) {
            return;
          }

          this.changeCommentBalloonAppearance(element.id, false);
        });

      this.currentFixedBalloonId = rectId;
    });
  }

  private closest(root: HTMLElement, selector: string): HTMLElement
  {
    let target: HTMLElement = root;
    let found: HTMLElement;
    while (true) {
      if (!target) {
        break;
      }
      if (target.matches(selector)) {
        found = target;
        break;
      }

      target = target.parentElement;
    }

    return found;
  }

  private getInputUITemplate(): string
  {
    return `
    <div class="container">
      <div class="input">
        <textarea></textarea>
      </div>
      <hr>
      <div class="colors">
        <ul>
          ${this.config.input.colors.map(color => {
      return `<li><a href="javascript:;" class="color" data-cc="${color}" style="background: ${color}"></a></li>`;
    }).join('')}
        </ul>
      </div>
      <hr>
      <div class="controls">
        <button class="btn-confirm">${this.config.message.inputUIConfirmText}</button>
        <button class="btn-cancel">${this.config.message.inputUICancelText}</button>
      </div>
    </div>
    `;
  }

  private getRemoteImageSize(url: string): Promise<Size>
  {
    return new Promise((resolve) => {
      const img  = new Image();
      img.onload = () => {
        resolve({
          width:  img.width,
          height: img.height,
        });
      };

      img.src = url;
    });
  }

  private getWindowSafeArea(): Coordinate
  {
    const safeAreaMargin = 10;

    return {
      x: window.innerWidth - safeAreaMargin,
      y: window.innerHeight + window.scrollY - safeAreaMargin,
    };
  }

  private makeDot(pos: Coordinate, color: string = 'black'): void
  {
    const div            = document.createElement('div');
    div.style.position   = 'fixed';
    div.style.top        = `${pos.y}px`;
    div.style.left       = `${pos.x}px`;
    div.style.width      = '5px';
    div.style.height     = '5px';
    div.style.background = color;
    document.body.appendChild(div);
  }
}

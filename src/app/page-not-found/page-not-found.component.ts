import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';

declare var $: any;

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit, AfterViewInit {

  @ViewChild('canvas') canvasRef: ElementRef;
  private lineDemo: LineDemo;

  ngOnInit() {
    this.lineDemo = new LineDemo(this.canvasRef.nativeElement);

    const img = $('#img');
    if (img.length) {
      const image = new Image();
      image.src = img[0].src;
      image.addEventListener('load', () => {
        this.lineDemo.init({image: image});
      }, false);
    } else if ($('#span').length) {
      this.lineDemo.init({
        fontSize: '340px',
        text: $('#span').html()
      });
    } else {
      this.lineDemo.init(null);
    }
  }

  ngAfterViewInit(): void {

  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.lineDemo.onMouseMove(event);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    this.lineDemo.onResize(event);
  }



}

export class LineDemo {
  private win = window;

  private points: any;
  private context: CanvasRenderingContext2D;
  private totalLines: any;
  private depth: any;
  private resizeInterval: any;
  private readonly _ctx: any;

  private settings = {
    fontFamily: 'Arial',
    fontSize: '500px',
    fontStyle: 'normal',
    fontWeight: 900,
    height: this.win.innerHeight * 0.5,
    lineHeight: 10,
    maxDepth: 8,
    text: '2D',
    width: this.win.innerWidth,
    image: null
  };

  constructor(ctx: any) {
    this._ctx = ctx;
    this.context = LineDemo.setCanvas(this._ctx, this.settings.width, this.settings.height);
  }

  private static setCanvas(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext('2d');
  }

  public init(options) {
    if (options) {
      this.settings = $.extend({}, this.settings, options);
    }
    if (this.settings.image) {
      const x = (this.settings.width - this.settings.image.width) * 0.5;
      const y = (this.settings.height - this.settings.image.height) * 0.5;
      this.context.drawImage(this.settings.image, x, y, this.settings.image.width, this.settings.image.height);
    } else {
      this.context.fillStyle = 'black';
      this.context.beginPath();
      this.context.font = this.settings.fontStyle + ' ' + this.settings.fontWeight + ' ' + this.settings.fontSize + ' ' +
        this.settings.fontFamily;
      this.context.textAlign = 'center';
      this.context.textBaseline = 'middle';
      this.context.fillText(this.settings.text, this.settings.width * 0.5 - 125, this.settings.height * 0.5);
      this.context.fill();
      this.context.closePath();
    }
    this.setup();
  }

  setup() {
    this.settings.height = Math.max(100, this.settings.height);
    this.settings.width = Math.max(100, this.settings.width);
    this.totalLines = Math.floor(this.settings.height / this.settings.lineHeight);
    this.settings.lineHeight = this.settings.height / this.totalLines;
    this.generatePoints();
    this.depth = this.settings.maxDepth;
    this.draw();
  }

  onMouseMove(event) {
    this.depth = Math.abs(this.settings.maxDepth * ((this.settings.height - event.pageY) / this.settings.height) );
    this.draw();
  }

  onResize(event) {
    if (this.resizeInterval) { clearTimeout(this.resizeInterval); }
    this.resizeInterval = setTimeout(() => {
      this.settings.height = this.win.innerHeight * 0.5;
      this.settings.width = this.win.innerWidth;
      this.context = LineDemo.setCanvas(this._ctx, this.settings.width, this.settings.height);
      this.init(null);
    }, 50);
  }

  generatePoints() {
    this.points = [];
    let data;
    for (let y = 0; y < this.totalLines; ++y) {
      data = this.context.getImageData(0, y * this.settings.lineHeight, this.settings.width, 1).data;
      this.points[y] = this.getPointsRow(data, y * this.settings.lineHeight);
    }
  }

  getPointsRow (data, y) {
    const row = [];
    let toggle = false;
    let x;
    for (let i = 3; i < data.length; i += 4) {
      if ((data[i] !== 0 && !toggle) || (data[i] === 0 && toggle)) {
        x = i / 4;
        toggle = !toggle;
        row[row.length] = {
          x: x,
          y: y
        };
      }
    }
    return row;
  }

  getDrawPoints (rowPoints) {
    const row = [];

    let x, y, diff, newX;

    const point1 = this.depth;
    const point2 = this.depth * 0.5;

    for (let i = 0; i < rowPoints.length; ++i) {

      x = rowPoints[i].x;
      y = rowPoints[i].y;

      if (i % 2 === 0) {

        row[row.length] = {
          cx: x - point1,
          cy: y,
          x: x - point1,
          y: y
        };

        if (row.length >= 2 && row[row.length - 1].x < row[row.length - 2].x) {
          diff = row[row.length - 2].x - row[row.length - 1].x;
          newX = row[row.length - 1].x + (diff * 0.5);
          row[row.length - 1].x = row[row.length - 2].x = newX;
          row[row.length - 1].cx = row[row.length - 2].cx = newX;
        }

        row[row.length] = {
          cx: x - point2,
          cy: y,
          x: x,
          y: y - (this.depth * 0.5)
        };

        row[row.length] = {
          cx: x + point2,
          cy: y - this.depth,
          x: x + point1,
          y: y - this.depth
        };

      } else {

        row[row.length] = {
          cx: x - point1,
          cy: y - this.depth,
          x: x - point1,
          y: y - this.depth
        };

        if (row.length >= 2 && row[row.length - 1].x < row[row.length - 2].x) {
          diff = row[row.length - 2].x - row[row.length - 1].x;
          newX = row[row.length - 1].x + (diff * 0.5);
          row[row.length - 1].x = row[row.length - 2].x = newX;
          row[row.length - 1].cx = row[row.length - 2].cx = newX;
        }

        row[row.length] = {
          cx: x - point2,
          cy: y - this.depth,
          x: x,
          y: y - (this.depth * 0.5)
        };

        row[row.length] = {
          cx: x + point2,
          cy: y,
          x: x + point1,
          y: y
        };
      }
    }

    return row;
  }

  draw() {
    this.context.clearRect(0, 0, this.settings.width, this.settings.height);
    this.context.strokeStyle = 'white';
    this.context.lineWidth = 2;
    let row;
    for (let i = 1; i < this.totalLines; ++i) {
      this.context.globalAlpha = (1 - i / this.totalLines) * 0.6;
      this.context.beginPath();
      this.context.moveTo(0, i * this.settings.lineHeight);
      row = this.getDrawPoints(this.points[i]);
      for (let j = 0; j < row.length; ++j) {
        this.context.quadraticCurveTo(row[j].cx, row[j].cy, row[j].x, row[j].y);
      }
      this.context.lineTo(this.settings.width, i * this.settings.lineHeight);
      this.context.stroke();
    }
  }

}


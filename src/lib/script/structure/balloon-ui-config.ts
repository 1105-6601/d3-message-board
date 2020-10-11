import { Size } from './size';

export interface BalloonUIConfig
{
  // width: number;
  // height: number;
  size: Size;
  margin: number;
  highlightColor: string;
  borderColor: string;
  borderWidth: number;
  arrowSize: number;
  autoResize: boolean;
  attachedFileLabelWidth: number;
}

export function newBalloonUIConfig(): BalloonUIConfig
{
  return {
    size:                   {
      width:  400,
      height: 300,
    },
    margin:                 20,
    highlightColor:         '#ff5252',
    borderColor:            '#455a64',
    borderWidth:            2,
    arrowSize:              10,
    autoResize:             true,
    attachedFileLabelWidth: 70,
  };
}

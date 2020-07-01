export interface BalloonUIConfig
{
  width: number;
  height: number;
  highlightColor: string;
  borderColor: string;
  borderWidth: number;
}

export function newBalloonUIConfig(): BalloonUIConfig
{
  return {
    width:          400,
    height:         300,
    highlightColor: '#ff5252',
    borderColor:    '#455a64',
    borderWidth:    2,
  };
}

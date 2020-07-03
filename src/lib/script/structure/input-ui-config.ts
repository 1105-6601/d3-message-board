export interface InputUIConfig
{
  width: number;
  height: number;
  margin: number;
  borderColor: string;
  borderWidth: number;
  colors: string[];
}

export function newInputUIConfig(): InputUIConfig
{
  return {
    width:       400,
    height:      300,
    margin:      20,
    borderColor: '#455a64',
    borderWidth: 2,
    colors:      [
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
    ],
  };
}

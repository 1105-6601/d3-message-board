export interface DrawUIConfig
{
  borderColor: string;
  borderWidth: number;
}

export function newDrawUIConfig(): DrawUIConfig
{
  return {
    borderColor: '#455a64',
    borderWidth: 5,
  };
}

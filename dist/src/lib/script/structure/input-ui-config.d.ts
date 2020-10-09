export interface InputUIConfig {
    width: number;
    height: number;
    margin: number;
    borderColor: string;
    borderWidth: number;
    colors: string[];
    enableFileUpload: boolean;
    fileUploadEndpoint: string;
}
export declare function newInputUIConfig(): InputUIConfig;

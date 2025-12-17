declare module "pdfjs-dist/build/pdf" {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };

  export function getDocument(params: any): {
    promise: Promise<{
      numPages: number;
      getPage(pageNumber: number): Promise<{
        getViewport(options: { scale: number }): {
          width: number;
          height: number;
        };
        render(params: {
          canvasContext: CanvasRenderingContext2D;
          viewport: { width: number; height: number };
          canvas: HTMLCanvasElement;
        }): { promise: Promise<void> };
      }>;
    }>;
  };
}



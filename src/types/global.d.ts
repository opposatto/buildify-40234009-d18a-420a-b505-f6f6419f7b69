
interface Window {
  FB?: {
    init: (options: { xfbml: boolean; version: string }) => void;
    XFBML: {
      parse: (element?: HTMLElement) => void;
    };
  };
  fbAsyncInit?: () => void;
  twttr?: any;
  instgrm?: any;
}
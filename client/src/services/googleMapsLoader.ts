import { Loader } from '@googlemaps/js-api-loader';

// Singleton Google Maps Loader to prevent conflicts
class GoogleMapsLoaderService {
  private static instance: GoogleMapsLoaderService;
  private loader: Loader | null = null;
  private loadingPromise: Promise<void> | null = null;
  private isLoaded = false;

  private constructor() {}

  static getInstance(): GoogleMapsLoaderService {
    if (!GoogleMapsLoaderService.instance) {
      GoogleMapsLoaderService.instance = new GoogleMapsLoaderService();
    }
    return GoogleMapsLoaderService.instance;
  }

  async load(apiKey: string): Promise<void> {
    // If already loaded, return immediately
    if (this.isLoaded) {
      console.log('✅ Google Maps API already loaded');
      return Promise.resolve();
    }

    // If currently loading, return the existing promise
    if (this.loadingPromise) {
      console.log('⏳ Google Maps API loading in progress...');
      return this.loadingPromise;
    }

    // Start loading
    console.log('📡 Loading Google Maps API with all libraries...');

    if (!this.loader) {
      this.loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['maps', 'drawing', 'geometry']
      });
    }

    this.loadingPromise = this.loader.load().then(() => {
      this.isLoaded = true;
      console.log('✅ Google Maps API loaded successfully');
    });

    return this.loadingPromise;
  }

  isGoogleMapsLoaded(): boolean {
    return this.isLoaded;
  }

  // Reset for testing or development
  reset(): void {
    this.loader = null;
    this.loadingPromise = null;
    this.isLoaded = false;
  }
}

export const googleMapsLoader = GoogleMapsLoaderService.getInstance();
import { Spot } from './spot';
import { Route } from './route';
import { Tutorial } from './tutorial';

/** Grouped global-search result set returned by GET /api/search?q=. */
export interface SearchResults {
  spots: Spot[];
  routes: Route[];
  tutorials: Tutorial[];
}

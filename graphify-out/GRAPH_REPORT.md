# Graph Report - .  (2026-06-05)

## Corpus Check
- Corpus is ~31,755 words - fits in a single context window. You may not need a graph.

## Summary
- 454 nodes · 690 edges · 29 communities (22 shown, 7 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 66 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Express API & Database|Express API & Database]]
- [[_COMMUNITY_UI Component Library|UI Component Library]]
- [[_COMMUNITY_Mobile Screens & Mock Data|Mobile Screens & Mock Data]]
- [[_COMMUNITY_Shared Type Definitions|Shared Type Definitions]]
- [[_COMMUNITY_API Dependencies|API Dependencies]]
- [[_COMMUNITY_Mobile Dependencies|Mobile Dependencies]]
- [[_COMMUNITY_Web Landing & Docs|Web Landing & Docs]]
- [[_COMMUNITY_Expo App Config|Expo App Config]]
- [[_COMMUNITY_Web Dependencies|Web Dependencies]]
- [[_COMMUNITY_Shared TSConfig|Shared TSConfig]]
- [[_COMMUNITY_Web TSConfig|Web TSConfig]]
- [[_COMMUNITY_UI Package Config|UI Package Config]]
- [[_COMMUNITY_Mobile TSConfig|Mobile TSConfig]]
- [[_COMMUNITY_Shared Package Config|Shared Package Config]]
- [[_COMMUNITY_API TSConfig|API TSConfig]]
- [[_COMMUNITY_Root Monorepo Config|Root Monorepo Config]]
- [[_COMMUNITY_API Legacy TSConfig|API Legacy TSConfig]]
- [[_COMMUNITY_UI TSConfig|UI TSConfig]]
- [[_COMMUNITY_Metro Bundler Config|Metro Bundler Config]]
- [[_COMMUNITY_Web Root Layout|Web Root Layout]]
- [[_COMMUNITY_Monorepo Infrastructure|Monorepo Infrastructure]]
- [[_COMMUNITY_Workspace Package Links|Workspace Package Links]]
- [[_COMMUNITY_PostGIS Geospatial|PostGIS Geospatial]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Mapbox Integration|Mapbox Integration]]
- [[_COMMUNITY_Zod Validation|Zod Validation]]
- [[_COMMUNITY_Weather API|Weather API]]

## God Nodes (most connected - your core abstractions)
1. `Color Design Tokens` - 20 edges
2. `query()` - 17 edges
3. `FontSize Design Tokens` - 17 edges
4. `compilerOptions` - 14 edges
5. `Radius Design Tokens` - 14 edges
6. `compilerOptions` - 13 edges
7. `Spot` - 12 edges
8. `authMiddleware()` - 11 edges
9. `expo` - 11 edges
10. `Tag()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Monorepo Root Scripts` --references--> `pnpm Workspace Config`  [INFERRED]
  package.json → pnpm-workspace.yaml
- `validate()` --calls--> `CreateSpot Validation Schema`  [INFERRED]
  apps/api/src/middleware/validate.ts → packages/shared/src/validators/spot.ts
- `validate()` --calls--> `Login Validation Schema`  [INFERRED]
  apps/api/src/middleware/validate.ts → packages/shared/src/validators/auth.ts
- `validate()` --calls--> `Register Validation Schema`  [INFERRED]
  apps/api/src/middleware/validate.ts → packages/shared/src/validators/auth.ts
- `Feed Type Interface` --references--> `Feeds Database Table`  [INFERRED]
  packages/shared/src/types/feed.ts → apps/api/src/migrate.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **JWT Auth Flow: Register/Login -> Token Issue -> Auth Middleware Verification** — routes_auth_authrouter, middleware_auth_authmiddleware, config_env_envconfig, concept_jwt_authentication [EXTRACTED 0.95]
- **GeoSpatial Spot Search Pipeline: PostGIS ST_DWithin with species/method filters** — routes_spots_spotrouter, config_database_query, concept_postgis_extension, concept_geo_spatial_search [INFERRED 0.85]
- **Route-Spot Composition: Routes contain ordered Spots via junction table** — concept_routes_table, concept_route_spots_table, concept_spots_table, routes_routes_routerouter [EXTRACTED 0.95]
- **Request Validation Pipeline: Zod Schema -> validate middleware -> route handler** — shared_validators_registerschema, shared_validators_loginschema, shared_validators_createspotschema, middleware_validate_validate [INFERRED 0.85]
- **Express Middleware Stack: helmet -> cors -> json -> routes -> errorHandler** — api_index_expressapp, middleware_errorhandler_errorhandler [EXTRACTED 0.95]
- **Database Bootstrap: Migration creates schema, Seed populates test data** — migrate_migrate, seed_seed, config_database_query [INFERRED 0.85]
- **Shared Type System Domain Model** — types_spot_spot, types_tutorial_tutorial, types_user_user, types_weather_weather [INFERRED 0.95]
- **Spot Creation Validation Pipeline** — validators_spot_creatspotschema, validators_spot_spotfilterschema, types_spot_spot, types_spot_spotfilter [INFERRED 0.85]
- **Auth Validation Pipeline** — validators_auth_registerschema, validators_auth_loginschema, types_user_user, types_user_authtokens [INFERRED 0.85]
- **UI Component Library** — components_button_button, components_card_card, components_feeditem_feeditem, components_filterchips_filterchips, components_pill_pill, components_routeitem_routeitem, components_searchbar_searchbar, components_sectionheader_sectionheader [INFERRED 0.95]
- **Geo Utility Module** — utils_geo_haversinedistance, utils_geo_torad, utils_geo_formatdistance [EXTRACTED 1.00]
- **Embedded User Reference Pattern** — types_spot_spot_uploader, types_tutorial_tutorial_author, types_user_authuser [INFERRED 0.85]
- **Tab Navigation System** — src_app_app, components_tabbar_tabbar, components_tabbar_tab, screens_homescreen, screens_spotsscreen, screens_navigationscreen, screens_learnscreen, screens_profilescreen [EXTRACTED 1.00]
- **Design Token System** — theme_tokens_colors, theme_tokens_spacing, theme_tokens_fontsize, theme_tokens_radius [EXTRACTED 1.00]
- **UI Component Library Package** — src_index_index, components_spotcard_spotcard, components_spotcard_spotcardlist, components_tabbar_tabbar, components_tabbar_tab, components_tag_tag, components_weatherstrip_weatherstrip, theme_tokens_colors, theme_tokens_spacing, theme_tokens_fontsize, theme_tokens_radius [EXTRACTED 1.00]
- **Screens Consuming Mock Data** — mock_data_mockdata, screens_homescreen, screens_spotsscreen, screens_learnscreen, screens_profilescreen [EXTRACTED 1.00]
- **HomeScreen Component Composition** — screens_homescreen, components_weatherstrip_weatherstrip, components_spotcard_spotcard, components_spotcard_spotcardlist [EXTRACTED 1.00]
- **Monorepo Cross-Package Path Resolution** — mobile_metroconfig, src_index_index [INFERRED 0.85]
- **Landing Page Prototype-to-Production Pipeline** — prototypes_landing_landing_prototype, apps_web_page_landingpage, apps_web_globals_css_design_tokens [INFERRED 0.85]
- **iOS Screen Prototype Suite** — prototypes_mobile_ios_homescreen, prototypes_screens_ios_route_screen, prototypes_screens_ios_nav_screen, prototypes_screens_ios_learn_screen, prototypes_screens_ios_profile_screen [EXTRACTED 1.00]
- **Cross-Platform Design Token System** — prototypes_design_visual_system, prototypes_design_ocean_teal, apps_web_globals_css_design_tokens [INFERRED 0.85]
- **Four-Phase MVP Development Plan** — docs_development_plan_phase1, docs_development_plan_phase2, docs_development_plan_phase3, docs_development_plan_phase4 [EXTRACTED 1.00]

## Communities (29 total, 7 thin omitted)

### Community 0 - "Express API & Database"
Cohesion: 0.07
Nodes (45): YULU Express Application, Feeds Database Table, GeoSpatial Search (ST_DWithin), JWT Authentication Flow, PostGIS Spatial Extension, Route Downloads Junction Table, Route-Spots Junction Table, Routes Database Table (+37 more)

### Community 1 - "UI Component Library"
Cohesion: 0.09
Nodes (44): Button(), ButtonProps, styles, Card(), CardProps, styles, FeedItem(), FeedItemProps (+36 more)

### Community 2 - "Mobile Screens & Mock Data"
Cohesion: 0.09
Nodes (35): SearchBar(), SectionHeader(), Tab, Mock Data Store, mockFeeds, mockRoutes, mockSpots, mockTutorials (+27 more)

### Community 3 - "Shared Type Definitions"
Cohesion: 0.07
Nodes (26): Feed, Route, RouteFilter, RouteSpot, Spot, Spot.uploader Embedded User, SpotFilter, Tutorial.author Embedded User (+18 more)

### Community 4 - "API Dependencies"
Cohesion: 0.06
Nodes (30): dependencies, bcryptjs, cors, dotenv, express, helmet, jsonwebtoken, multer (+22 more)

### Community 5 - "Mobile Dependencies"
Cohesion: 0.07
Nodes (29): dependencies, axios, expo, expo-asset, expo-constants, expo-font, expo-location, expo-router (+21 more)

### Community 6 - "Web Landing & Docs"
Cohesion: 0.13
Nodes (27): CSS Design Token System (globals.css), Root Layout Component, Landing Page Component, Phase 1: Foundation + Core (4-5 weeks), Phase 2: Map + Navigation + Learn (3-4 weeks), Phase 3: Community + Polish (2-3 weeks), Phase 4: iOS Widget + Store Launch (2-3 weeks), 5-Tab Mobile Navigation (+19 more)

### Community 7 - "Expo App Config"
Cohesion: 0.11
Nodes (17): backgroundColor, adaptiveIcon, package, expo, android, icon, ios, name (+9 more)

### Community 8 - "Web Dependencies"
Cohesion: 0.11
Nodes (17): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+9 more)

### Community 9 - "Shared TSConfig"
Cohesion: 0.12
Nodes (16): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir (+8 more)

### Community 10 - "Web TSConfig"
Cohesion: 0.13
Nodes (14): Web App tsconfig, compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, module (+6 more)

### Community 11 - "UI Package Config"
Cohesion: 0.13
Nodes (14): dependencies, react, react-native, devDependencies, @types/react, typescript, main, name (+6 more)

### Community 12 - "Mobile TSConfig"
Cohesion: 0.15
Nodes (12): compilerOptions, allowJs, incremental, jsx, lib, noEmit, paths, plugins (+4 more)

### Community 13 - "Shared Package Config"
Cohesion: 0.17
Nodes (11): dependencies, zod, devDependencies, typescript, main, name, private, scripts (+3 more)

### Community 14 - "API TSConfig"
Cohesion: 0.18
Nodes (10): compilerOptions, declaration, declarationMap, jsx, outDir, paths, extends, include (+2 more)

### Community 15 - "Root Monorepo Config"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev:api, dev:mobile, dev:web, lint (+2 more)

### Community 16 - "API Legacy TSConfig"
Cohesion: 0.29
Nodes (6): compilerOptions, jsx, outDir, rootDir, extends, include

### Community 17 - "UI TSConfig"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 18 - "Metro Bundler Config"
Cohesion: 0.40
Nodes (4): config, { getDefaultConfig }, monorepoRoot, path

### Community 20 - "Monorepo Infrastructure"
Cohesion: 0.67
Nodes (3): pnpm Monorepo Architecture, Monorepo Root Scripts, pnpm Workspace Config

## Knowledge Gaps
- **239 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+234 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `Shared Type Definitions` to `Mobile Screens & Mock Data`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `registerSchema` connect `Shared Type Definitions` to `Express API & Database`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _242 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Express API & Database` be split into smaller, more focused modules?**
  _Cohesion score 0.0715846994535519 - nodes in this community are weakly interconnected._
- **Should `UI Component Library` be split into smaller, more focused modules?**
  _Cohesion score 0.08583959899749373 - nodes in this community are weakly interconnected._
- **Should `Mobile Screens & Mock Data` be split into smaller, more focused modules?**
  _Cohesion score 0.08879492600422834 - nodes in this community are weakly interconnected._
- **Should `Shared Type Definitions` be split into smaller, more focused modules?**
  _Cohesion score 0.07254623044096728 - nodes in this community are weakly interconnected._
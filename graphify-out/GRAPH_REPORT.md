# Graph Report - Marketplace Kucing  (2026-05-18)

## Corpus Check
- 15 files · ~40,692 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 119 nodes · 211 edges · 9 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `a` - 18 edges
2. `v` - 15 edges
3. `z()` - 14 edges
4. `f()` - 8 edges
5. `T()` - 8 edges
6. `r` - 7 edges
7. `U()` - 7 edges
8. `y` - 6 edges
9. `m()` - 5 edges
10. `$()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `createClient()`  [INFERRED]
  src\app\api\auth\callback\route.ts → src\utils\supabase\server.ts
- `handleSignOut()` --calls--> `createClient()`  [INFERRED]
  src\app\dashboard\page.tsx → src\utils\supabase\server.ts
- `checkUser()` --calls--> `createClient()`  [INFERRED]
  src\app\login\page.tsx → src\utils\supabase\server.ts
- `handleGoogleLogin()` --calls--> `createClient()`  [INFERRED]
  src\app\login\page.tsx → src\utils\supabase\server.ts
- `middleware()` --calls--> `updateSession()`  [INFERRED]
  src\middleware.ts → src\utils\supabase\middleware.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.1
Nodes (13): b(), d(), deleteCacheAndMetadata(), e(), et, f(), G, i (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (3): a, c(), h()

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (5): m(), st(), T(), U(), v

### Community 3 - "Community 3"
Cohesion: 0.21
Nodes (2): $(), z()

### Community 4 - "Community 4"
Cohesion: 0.27
Nodes (3): j(), q(), r

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (5): GET(), handleSignOut(), checkUser(), handleGoogleLogin(), createClient()

### Community 6 - "Community 6"
Cohesion: 0.39
Nodes (2): w(), y

### Community 7 - "Community 7"
Cohesion: 0.5
Nodes (2): middleware(), updateSession()

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (2): n(), r()

## Knowledge Gaps
- **Thin community `Community 3`** (13 nodes): `$()`, `z()`, `.activate()`, `.addToCacheList()`, `.createHandlerBoundToURL()`, `.getCachedURLs()`, `.getCacheKeyForURL()`, `.getIntegrityForCacheKey()`, `.getURLsToCacheKeys()`, `.install()`, `.matchPrecache()`, `.precache()`, `.strategy()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (8 nodes): `w()`, `y`, `.A()`, `.constructor()`, `.K()`, `.S()`, `.U()`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (4 nodes): `middleware()`, `middleware.ts`, `middleware.ts`, `updateSession()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (3 nodes): `sw.js`, `n()`, `r()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `a` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.153) - this node is a cross-community bridge._
- **Why does `z()` connect `Community 3` to `Community 0`, `Community 2`, `Community 6`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Why does `v` connect `Community 2` to `Community 0`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
# Base Chess - Project Structure Reorganization

## New Directory Structure

### `/app/(pages)` - Route Groups (Main Pages)
Each route group contains a `page.tsx` and `layout.tsx` specific to that section.

- **`/play`** - Single Player & Local Multiplayer
  - Components: ChessBoard, GameControls, MoveHistory
  - Files to move: ChessBoardNew.tsx, GameControls.tsx, GameInfo.tsx, MoveHistory.tsx

- **`/training`** - Learning Paths & Lessons
  - Components: LearningDashboard
  - Files to move: LearningDashboard.tsx

- **`/coaches`** - Coach Marketplace
  - Components: CoachMarketplace
  - Files to move: CoachMarketplace.tsx

- **`/puzzles`** - Puzzle Training
  - Components: PuzzleBoard, PuzzleTraining
  - Files to move: PuzzleTraining.tsx, PuzzleBoard.tsx

- **`/online`** - Online Multiplayer
  - Components: GameLobbyOnline, OnlineGame
  - Files to move: GameLobbyOnline.tsx, OnlineGame.tsx, GameLobby.tsx

- **`/settings`** - User Preferences
  - Components: ThemeSwitcher, Preferences
  - Files to move: ThemeSwitcher.tsx

### `/components` - Shared Components

#### `/components/common`
Reusable components used across pages
- Navigation/Header components
- Footer components
- Breadcrumbs

#### `/components/chess`
Chess-specific components
- ChessBoard.tsx (main board)
- PieceRenderer.tsx
- SquareRenderer.tsx
- BoardUtils.tsx

#### `/components/ui`
UI building blocks
- Button.tsx
- Card.tsx
- Badge.tsx
- Modal.tsx
- Input.tsx

#### `/components/features`
Feature-specific components
- CoachMarketplace.tsx
- LearningDashboard.tsx
- GameControls.tsx
- MoveHistory.tsx
- etc.

### `/styles` - Global & Shared Styles
- `variables.css` - CSS custom properties
- `base.css` - Base styles
- `layout.css` - Layout utilities
- Theme-specific files (if needed)

### `/contexts` - React Contexts
- ThemeContext.tsx

### `/hooks` - Custom Hooks
- useChessContract.ts
- useAdvancedContracts.ts
- useChessContractNew.ts

### `/lib` - Utilities & Libraries
- chessEngine.ts
- chessAI.ts
- genkitChessAI.ts
- puzzleData.ts
- lessonData.ts
- coachData.ts

### `/contracts` - Web3 & Contract Files
- abis.ts
- addresses.ts

## File Movement Plan

### Phase 1: Create Route Groups
1. Create `/play/page.tsx` with play section UI
2. Create `/training/page.tsx` with training section UI
3. Create `/coaches/page.tsx` with coach section UI
4. Create `/puzzles/page.tsx` with puzzle section UI
5. Create `/online/page.tsx` with online section UI
6. Create `/settings/page.tsx` with settings section UI

### Phase 2: Organize Components
Move and reorganize existing components into proper folders:
- Chess components → `/components/chess`
- UI components → `/components/ui`
- Feature components → `/components/features`

### Phase 3: Consolidate Styles
- Move individual `.module.css` files to their respective component folders
- Create shared style utilities in `/styles`

### Phase 4: Update Imports
- Update all import paths in components
- Update page imports to reference new locations

## Benefits

✅ **Better Code Organization** - Each page section is self-contained
✅ **Easier Scaling** - New features go to clear locations
✅ **Code Splitting** - Next.js will automatically split routes
✅ **Reduced Imports** - Components are closer to where they're used
✅ **Clear Dependencies** - Easy to see component relationships
✅ **Maintainability** - Find code faster, understand structure better

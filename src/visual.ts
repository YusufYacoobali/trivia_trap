import { C } from './theme';

// Shared surface tokens for the reusable Card / PrimaryButton components.
// Option- and hint-specific visuals live with QuestionScreen, which owns that
// screen's look.

// Generic neutral card surface (white, soft grey 3D shadow + hairline border).
export const CARD = {
  radius: 22,
  depth: 5,
  shadow: C.lineDeep,
  border: C.line,
  face: '#fff',
};

// Shared primary (accent) call-to-action button geometry.
export const PRIMARY_BTN = {
  radius: 20,
  depth: 6,
};

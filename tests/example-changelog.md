# @peopleplus/components

## 0.5.1

### Patch Changes

- d273173: add ability to configure cloudflare sdk src

## 0.5.0

### Minor Changes

- 3468e1b:

  ### Breaking Change

  Remove size option from icon buttons in favour of the new dedicated size property.

  #### Migration

  Replace instances of `icon`, `icon="sm"` and `icon="md"` with `icon size="lg"`, `icon size="sm"` and
  `icon` respectively.

  Note that what was `md` is now the default, and what was the default is now `lg`.

- 3468e1b:

  ### Breaking Change

  The default height of regular and icon buttonsa are now the same as the select component

### Patch Changes

- 3468e1b: add muted variant to buttons
- 3468e1b: add size variants to buttons
- 3468e1b: add shape variants to buttons

## 0.4.1

### Patch Changes

- ff3492b: fix typo in year label on calendar
- ff3492b: add more useful labels to calendar entries and days
- ff3492b: pass index to calendar entry slot
- a388644: allow passing 'open' store to popover
- ff3492b: allow setting arbitrary props on the calendar

## 0.4.0

### Minor Changes

- 306fe27: Add Calendar component
- fc16e7e: Add Select input component

### Patch Changes

- 4c81711: add small and medium icon sizes to Button component
- a03b75a: allow settings flip, overlap, and sameWidth on popover

## 0.3.1

### Patch Changes

- 67833a6: Add topClass prop in the footer to allow changes on breakpoint

## 0.3.0

### Minor Changes

- 0f82572: Add support for using drag handles on sortable grid items.

  The API is slightly different when using an explicit drag handle as previously an "item" acted as a
  drag handle, drop target, and drag image all in one. These are now exposed as separate actions -
  `handle`, `target`, and `image` respectively. The existing `item` action is still available and
  useable, but does not support being used in conjunction with any of the new actions.

  Unlike when using the existing `item` action, there are no styles applied for you when dragging.
  Instead the `data-dragging` and `data-dragging-over` attributes are set. This allows you to apply
  custom styling when an item is being dragged, or has an item dragged over it. Tailwind supports this
  nicely with the `data-[]` modifier. E.g. to emulate the previous functionality
  `data-[dragging-over]:opacity-50`

  Full Example:

  ```svelte
  <div
      class="transition-opacity data-[dragging-over]:opacity-50 data-[dragging]:opacity-0"
      use:sortable.target={item.id}
      use:sortable.image={item.id}
  >
      <div
          use:sortable.handle={item.id}
      >
          <GripHorizontalIcon />
      </div>
      My Grid Item
  </div>
  ```

  As shown, the actions can be applied to the same element as needed.

## 0.2.1

### Patch Changes

- 972e49d: Remove the width restriction from footer

## 0.2.0

### Minor Changes

- 855f8a0: support dark mode on tooltips, improve default behaviour whilst making it configurable

### Patch Changes

- 4a20b15: Update lucide-svelte icon paths

## 0.1.2

### Patch Changes

- 3bf27aa: support nested sortable grid/lists, with child sortables taking precedence

## 0.1.1

### Patch Changes

- 8ba3c7f: import lucide icons directly for faster build times
- 8307712: Fixing the footer flex basis ratio to fix the email overlap bug.

## 0.1.0

### Minor Changes

- 503e607: move package into peopleplus npm organisation

## 0.0.36

### Patch Changes

- 618202b: add ability to change/translate the cookie consent text
- c6d0a4a: Add a tooltip as an interactive overlay that presents details about a component when it is on keyboard focus or hovered, and the position to be configurable.
- f4d8590: Fix stepper border radius for consistency

## 0.0.35

### Patch Changes

- 900d619: spread restprops onto the dropdown menu components

## 0.0.34

### Patch Changes

- f71aec5: Added a Gauge component to use data as a measure of speed or progress towards a goal.
- 63e2b87: The SidebarItem active colour is now set to primary colour.
- 63e2b87: Add dropdown menu component

## 0.0.33

### Patch Changes

- 62e7035: Added 'Collapsible', an interactive component which expands/collapses a panel.

## 0.0.32

### Patch Changes

- 152bfec: - Introduced `overlayClass` prop to allow custom styling on the negative space of the Drawer component.

  - The default 'Close Drawer' button has been removed.
  - Clicking outside the drawer area now dismisses the drawer.

  The changes aim to expand customisation capabilities allowing it to fit a wider range of use cases.

  #### How to Update Your Code:

  - If you rely on the 'Close Drawer' button, you will now need to add it manually to the slot.
  - To prevent the drawer from being dismissible by clicking outside, add `disableClickOutside` to the component props.

## 0.0.31

### Patch Changes

- 4690a2c: Set up changesets for changelog and release management

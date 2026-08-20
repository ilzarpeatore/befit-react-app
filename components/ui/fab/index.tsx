'use client';
import { createFab } from '@gluestack-ui/core/fab/creator';
import { UIIcon } from '@gluestack-ui/core/icon/creator';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { tva, useStyleContext, withStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import { styled } from 'nativewind';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { GlassView, isGlassEffectAPIAvailable } from '@components/ui/glass-view';

const SCOPE = 'FAB';
const Root = withStyleContext(Pressable, SCOPE);

const StyledUIIcon = styled(UIIcon, { className: "style" });

const UIFab = createFab({
  Root: Root,
  Label: Text,
  Icon: StyledUIIcon,
});

const fabStyle = tva({
  base: 'group/fab rounded-full z-20 p-4 flex-row items-center justify-center absolute hover:bg-primary/90 active:bg-primary/80 disabled:opacity-40 disabled:pointer-events-all disabled:cursor-not-allowed data-[focus=true]:web:outline-none data-[focus-visible=true]:web:ring-2 data-[focus-visible=true]:web:ring-indicator-info shadow-hard-2',
  variants: {
    size: {
      sm: 'px-3.5 py-1.5',
      md: 'px-4  py-2',
      lg: 'px-5 py-3',
    },
    placement: {
      'top right': 'top-4 right-4',
      'top left': 'top-4 left-4',
      'bottom right': 'bottom-4 right-4',
      'bottom left': 'bottom-4 left-4',
      'top center': 'top-4 self-center',
      'bottom center': 'bottom-4 self-center',
    },
    // bg-primary solo hace falta como fondo de reserva cuando NO hay
    // Liquid Glass real (Android, iOS<26) — con glass real el material
    // translúcido lo pinta el GlassView de dentro del botón (ver Fab).
    hasGlass: {
      true: '',
      false: 'bg-primary',
    },
  },
});

const fabLabelStyle = tva({
  base: 'text-primary-foreground/90 font-normal font-body tracking-md text-left mx-2',
  variants: {
    isTruncated: {
      true: '',
    },
    bold: {
      true: 'font-bold',
    },
    underline: {
      true: 'underline',
    },
    strikeThrough: {
      true: 'line-through',
    },
    size: {

      'sm': 'text-sm',
      'md': 'text-base',
      'lg': 'text-lg',

    },
    sub: {
      true: 'text-xs',
    },
    italic: {
      true: 'italic',
    },
    highlight: {
      true: 'bg-yellow-500',
    },
  },
  parentVariants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
});

const fabIconStyle = tva({
  base: 'text-primary-foreground/90 fill-none',
  variants: {
    size: {
      'sm': 'h-3.5 w-3.5',
      'md': 'h-4 w-4',
      'lg': 'h-5 w-5',
    },
  },
});

// `children` se fuerza a ReactNode plano: el tipo heredado de Pressable
// admite render-prop ((state) => ReactNode), pero Fab ahora siempre inyecta
// un <GlassView/> hermano junto a los children reales, y esa forma no es
// compatible con children-como-función.
type IFabProps = Omit<
  React.ComponentPropsWithoutRef<typeof UIFab>,
  'context' | 'children'
> &
  VariantProps<typeof fabStyle> & { children?: React.ReactNode };

const Fab = React.forwardRef<React.ComponentRef<typeof UIFab>, IFabProps>(
  function Fab(
    { size = 'md', placement = 'bottom right', className, children, ...props },
    ref
  ) {
    return (
      <UIFab
        ref={ref}
        {...props}
        className={fabStyle({
          size,
          placement,
          hasGlass: isGlassEffectAPIAvailable(),
          class: className,
        })}
        context={{ size }}
      >
        {/* Wrapper propio con overflow:hidden (no en el Pressable Root, que
            lleva shadow-hard-2 -- overflow:hidden ahi recortaria la sombra).
            GlassView solo aplica su borderRadius nativo si el Liquid Glass
            real esta disponible y ya se monto (misma nota que en
            WorkoutMinimizedBar/Card); sin este wrapper se veian las
            esquinas cuadradas del GlassView sobresaliendo del circulo. */}
        <View className="absolute inset-0 rounded-full overflow-hidden">
          <GlassView glassEffectStyle="regular" className="flex-1" />
        </View>
        {children}
      </UIFab>
    );
  }
);

type IFabLabelProps = React.ComponentPropsWithoutRef<typeof UIFab.Label> &
  VariantProps<typeof fabLabelStyle>;

const FabLabel = React.forwardRef<
  React.ComponentRef<typeof UIFab.Label>,
  IFabLabelProps
>(function FabLabel(
  {
    size,
    isTruncated = false,
    bold = false,
    underline = false,
    strikeThrough = false,
    className,
    ...props
  },
  ref
) {
  const { size: parentSize } = useStyleContext(SCOPE);
  return (
    <UIFab.Label
      ref={ref}
      {...props}
      className={fabLabelStyle({
        parentVariants: {
          size: parentSize,
        },
        size,
        isTruncated,
        bold,
        underline,
        strikeThrough,
        class: className,
      })}
    />
  );
});

type IFabIconProps = React.ComponentPropsWithoutRef<typeof UIFab.Icon> &
  VariantProps<typeof fabIconStyle> & {
    height?: number;
    width?: number;
  };

const FabIcon = React.forwardRef<
  React.ComponentRef<typeof UIFab.Icon>,
  IFabIconProps
>(function FabIcon({ size, className, ...props }, ref) {
  const { size: parentSize } = useStyleContext(SCOPE);

  if (typeof size === 'number') {
    return (
      <UIFab.Icon
        ref={ref}
        {...props}
        className={fabIconStyle({ class: className })}
        size={size}
      />
    );
  } else if (
    (props.height !== undefined || props.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UIFab.Icon
        ref={ref}
        {...props}
        className={fabIconStyle({ class: className })}
      />
    );
  }
  return (
    <UIFab.Icon
      ref={ref}
      {...props}
      className={fabIconStyle({
        parentVariants: {
          size: parentSize,
        },
        size,
        class: className,
      })}
    />
  );
});

Fab.displayName = 'Fab';
FabLabel.displayName = 'FabLabel';
FabIcon.displayName = 'FabIcon';

export { Fab, FabIcon, FabLabel };

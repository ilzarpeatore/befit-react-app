'use client';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';

// Envuelve Ionicons (usado en toda la app) para que acepte className y
// pueda tomar color de los tokens de global.css (ej. className="text-foreground").
// Sin esto, pasar un string tipo "rgb(var(--foreground))" directo a `color`
// no se resuelve — esa sintaxis solo se procesa dentro de className.
const Icon = styled(Ionicons, { className: 'style' });

export { Icon };

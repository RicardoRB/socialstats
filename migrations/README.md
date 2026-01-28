# Migraciones de Base de Datos para Supabase

Este directorio contiene los scripts SQL necesarios para configurar la base de datos del proyecto.

## Estructura
- `0001_init.sql`: Script inicial que crea las tablas `social_providers`, `social_accounts`, `metrics` y `sync_jobs`, junto con sus índices y restricciones.

## Cómo aplicar las migraciones

### Usando el SQL Editor de Supabase (Más sencillo)
1. Accede al [Panel de Supabase](https://app.supabase.com/).
2. Selecciona tu proyecto.
3. En el menú lateral izquierdo, haz clic en **SQL Editor**.
4. Haz clic en **New query**.
5. Abre el archivo `migrations/0001_init.sql` de este repositorio.
6. Copia todo el contenido del archivo y pégalo en el editor de SQL de Supabase.
7. Haz clic en el botón **Run** (Ejecutar).

### Usando Supabase CLI (Avanzado)
Si prefieres usar la CLI de Supabase, puedes aplicar el archivo utilizando `psql` con la cadena de conexión de tu base de datos:

```bash
# Ejemplo usando psql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f migrations/0001_init.sql
```

También puedes integrarlo en el flujo estándar de Supabase moviendo el archivo a `supabase/migrations/` y ejecutando:

```bash
supabase db push
```

## Notas sobre Idempotencia
Todos los scripts de este directorio utilizan cláusulas `IF NOT EXISTS` para tablas e índices. Esto significa que puedes ejecutar los scripts varias veces sin riesgo de sobrescribir datos existentes o causar errores por objetos duplicados.

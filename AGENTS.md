# AGENTS.md

## Proyecto
- **Nombre:** Pose Me
- **Objetivo:** app mobile para tomar fotos estilo Instagram con referencia visual (pose card) mientras se dispara.
- **Estado actual:** MVP en React Native con arquitectura en capas (`application` + `infrastructure`) y UI principal en `App.tsx`.

## Mapa rapido del repo
- `SPEC.md`: especificacion funcional del producto.
- `TECH.md`: decisiones tecnicas y roadmap tecnico.
- `package.json` (raiz): scripts de orquestacion del workspace.
- `app/package.json`: scripts y dependencias reales de la app mobile.
- `app/App.tsx`: pantalla principal/UI actual.
- `app/src/application`: casos de uso y puertos (logica de negocio).
- `app/src/infrastructure`: implementaciones concretas (persistencia, adapters).
- `app/tests/unit`: tests unitarios de casos de uso.
- `app/__tests__/App.test.tsx`: test base de rendering de app.
- `app/android`: proyecto Android nativo (Gradle).
- `app/ios`: configuracion iOS (Pods/entorno).

## Stack tecnico
- **App framework:** React Native `0.84.0`
- **Lenguaje:** TypeScript `^5.8.3`
- **Navegacion:** `@react-navigation/native` + `@react-navigation/native-stack`
- **Estado:** React hooks + `zustand`
- **Persistencia local:** `@react-native-async-storage/async-storage`
- **Camara:** `react-native-vision-camera`
- **Testing:** Jest (`preset: react-native`) + `react-test-renderer`
- **Linting:** ESLint
- **iOS deps:** Bundler + CocoaPods

## Setup
Desde la raiz del repo:

```bash
npm run setup
```

Solo setup iOS:

```bash
npm run setup:ios
```

## Correr la app (dev)
Desde la raiz del repo:

```bash
npm run start
npm run android
npm run ios
```

Tambien hay soporte para dispositivo iOS fisico:

```bash
npm run ios:device
```

## Tests
Ejecutar todos los tests desde raiz:

```bash
npm test
```

Ejecutar tests unitarios puntuales (casos de uso):

```bash
npm --prefix app test -- app/tests/unit
```

## Builds
### Build local de desarrollo
- Android (debug):

```bash
npm run android
```

- iOS (simulador):

```bash
npm run ios
```

### Build Android release (artefactos)
Desde `app/android`:

```bash
./gradlew assembleRelease
./gradlew bundleRelease
```

Salida esperada:
- APK: `app/android/app/build/outputs/apk/release/`
- AAB: `app/android/app/build/outputs/bundle/release/`

### Build iOS release
- Recomendado: archivar desde Xcode (scheme de la app, configuracion Release).
- Alternativa CLI: `xcodebuild` sobre el workspace/scheme del proyecto cuando esten definidos.

## Convenciones operativas para agentes
- Antes de modificar codigo, revisar branch actual y evitar `main/master/v1`.
- No hacer commits ni PR salvo que el usuario lo pida explicitamente.
- Mantener enfoque TDD para cambios de codigo (primero tests unitarios).
- Evitar cambios destructivos de git (`reset --hard`, `checkout --`) salvo instruccion explicita.

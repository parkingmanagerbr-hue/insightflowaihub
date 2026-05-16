# InsightFlow — Versão Android

O app Android usa **Capacitor** para empacotar o web app como APK nativo.

## Pré-requisitos

| Ferramenta | Versão | Download |
|---|---|---|
| Android Studio | Ladybug+ | https://developer.android.com/studio |
| JDK | 17+ | incluído no Android Studio |
| Node.js | 18+ | já instalado |

## Estrutura

```
InsightFlow/
├── android/                 ← Projeto Android nativo (Capacitor)
│   ├── app/
│   │   ├── build.gradle     ← Config do app (applicationId, versão)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── assets/public/  ← Web assets copiados pelo cap sync
│   │       └── res/         ← Ícones, cores, splash
├── capacitor.config.ts      ← Config do Capacitor
├── dist/                    ← Build web (gerado pelo Vite)
└── scripts/build-android.mjs ← Script de build
```

## Fluxo de Build

### 1. Build + Sync (sempre que mudar o código)
```bash
npm run android:sync
```
Isso executa `vite build` (com base `./`) e `cap sync android`.

### 2. Abrir no Android Studio
```bash
npm run android:open
```

### 3. Gerar APK de Debug
No Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**

### 4. Gerar APK de Release (distribuição)
No Android Studio: **Build > Generate Signed Bundle / APK**

## Scripts npm

| Comando | O que faz |
|---|---|
| `npm run build:android` | Build Vite com `base: './'` para Capacitor |
| `npm run android:sync` | Build + sync para android/ |
| `npm run android:open` | Abre o projeto no Android Studio |
| `npm run android:run` | Roda no emulador/dispositivo conectado |

## Informações do App

| Campo | Valor |
|---|---|
| App ID | `com.insightflow.app` |
| App Name | InsightFlow |
| Min SDK | 24 (Android 7.0+) |
| Target SDK | 36 (Android 15) |
| Versão | 1.0 |

## Supabase Auth no Mobile

O redirect URL para OAuth deve ser configurado no Supabase Dashboard:
- **Allowed Redirect URLs**: `com.insightflow.app://`

Para autenticação por email/senha, não é necessária configuração adicional.

## Ícone do App

Para substituir o ícone padrão:
1. Prepare um PNG 1024×1024
2. No Android Studio: **File > New > Image Asset**
3. Selecione o PNG e gere os mipmap-* automaticamente

## Atualizar após mudanças no código

```bash
npm run android:sync    # rebuild + sync
npm run android:open    # abre no Android Studio
# No AS: Build > Build APK(s)
```

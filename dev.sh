#!/bin/zsh

echo ""
echo "🚀 Iniciando ebnjaOS_beta..."
echo ""

cd /Users/benjaminlarrondo/Documents/ebnjaOS_beta || exit

echo "📂 Repo:"
pwd

echo ""
echo "🌿 Git status:"
git status --short

echo ""
echo "📦 Instalando dependencias si faltan..."
npm install

echo ""
echo "🧪 Validando proyecto..."
npm run typecheck
npm run lint

echo ""
echo "🌐 Levantando entorno Vite..."
npm run dev

# Vídeo demonstrativo local

O vídeo é gerado inteiramente no computador, usando os mocks do Angular. A configuração
`demo` não acessa a API e o roteiro do Playwright bloqueia requisições do navegador para
qualquer host diferente de `127.0.0.1` e `localhost`.

## Gerar

```powershell
npm run demo:video
```

Antes do primeiro uso, instale o Piper e baixe a voz brasileira open source:

```powershell
python -m pip install -r tools/demo/requirements.txt
python -m piper.download_voices --download-dir tools/demo/voices pt_BR-faber-medium
```

Depois do download, a síntese da voz é executada localmente e sem API. O resultado fica em:

```text
artifacts/demo-video/musica-da-gloria.mp4
```

O diretório de saída, os caches do Argo e os relatórios do Playwright estão no
`.gitignore`. A geração não realiza commit, push, upload ou deploy.

Os executáveis locais `ffmpeg` e `ffprobe` são resolvidos automaticamente pelas
dependências do projeto; não é necessário instalá-los globalmente no Windows.

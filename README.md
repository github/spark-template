# workbench-template
a template for workbench apps

### Using for a Dotcom Codespace 

You may want to use a production Codespace for GitHub local development. To do so, you can:

1. Create a github/github following your normal process for workbench (i.e. "your dotcom codespace")
2. Create a codespace for Workbench Template on main. (i.e. "your workbench codespace")
3. In your workbench codespace, run `utils/generate-codespace-data.sh` - this will create a TypeScript file called `utils/codespace_data.ts` with an object representing Codespace data. 
4. In your workbench codespace, copy the entire contents of `utils/codespace_data.ts`
5. In your dotcom codespace, paste the contents you just copied into the top of `ui/packages/workbench/lsp/use-codespaces.ts`
6. In your dotcom codespace, in the `ui/packages/workbench/lsp/use-codespaces.ts` file, you'll find commented out code referencing `if (process.env.NODE_ENV === 'development') {` - uncomment those if blocks. 
7. In the copilot workbench, you'll now be connected to your production workbench codespace for the following tasks:
    - terminal
    - live preview
    - build events

    


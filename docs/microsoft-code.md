# Microsoft Code tips

## babel

Due to code mangling, this will not by debug correctly under code by default.  To overcome this, try setting the following in launch.json :

    {
        ...
        "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/babel-node",
        "sourceMaps": true
        ...
    }


## node2 debug

Using process.stdout.write has issues under the node2 debugger, so output will not be seen in the debug console.  Configuring stdout to use the terminal output in launch.json appears to be a workaround:


    {
        ...
        "console": "integratedTerminal"
        ...
    }
    


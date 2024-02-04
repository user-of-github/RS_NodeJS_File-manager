## _Simple File Manager_  
___   
### _Manual:_  
To run this console application, use command `npm run start -- --username=YOUR_NAME`. Or just use `npm run start:with-default-user`.  
#### _About paths:_  
1. If command requires only one path argument, for example `cd PATH`, `add PATH` etc., then you can optionally wrap path with quotes.
For example, `cd "./files"`, `cd ./files`, `cd ./folder with space/files`, `cd "./folder with space/files"`;  
2. If command requires 2+ paths and one of them contains space — then you _must__ wrap this path with quotes. For example: 
`cp ./folder1/file1.txt "../folder with space/folder2"`, `cp "../folder with space/folder2" ./folder1` or also wrap all: `cp "../folder with space/folder2" "./folder1"`.  
3. If my parser considers you inserting invalid number of paths for command or inserting them in not valid way — it will abort operation and print warning about this.
4. _You can see parser's expected logic in `./FileManager/tests/PathService.test.js`_

___  
### _Technologies stack:_  
- _Node.js_  
- _JavaScript_  

___   

###### Copyright © 2024 
###### Created by Slutski Mikita  
###### Inspired by Rolling Scopes and RS NodeJS 2024 Q1

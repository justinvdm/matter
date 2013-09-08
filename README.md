# matter
Flexible front matter parser.

```javascript
matter.yaml('---\nfoo: bar\n---');
// => {foo: bar}

matter.yaml.inFile('./stuff.md', function(err, data) {
  // ...
});

matter.json('---\n{"foo": "bar"}\n---');
// => {foo: bar}

matter.json.inFile('./stuff.md', function(err, data) {
  // ...
});
```

---
# pagination_prev: null
# pagination_next: null
authors: [unicop]
last_updated:
  date: 11/25/2022
  author: Ofri Peretz
tags: [JavaScript, Modules]
---

# Raw Script 🏷️

:::note
🔙 to **[Modules Summary](./summary.md)**.

:::

Raw `<script\>` loading, where dependencies are implicit, and exports are vomited onto the window object.

This convention does not have an official name.

Let me show you an example what it means implicitly vomited onto the window object:

```html
<body>
  <script>
    // script 1
    window.foo = { bar: 42 };
  </script>
  <script>
    // script 2
    console.log(window.foo.bar); // 42;
  </script>
</body>

<!-- 
    But when replacing scripts order, will cause an error, because script 2 depends on script 1 to execute.
-->
<body>
  <script>
    // script 2
    console.log(window.foo.bar); // ERROR: Uncaught TypeError: Cannot read properties of undefined (reading 'bar')
  </script>
  <script>
    // script 1
    window.foo = { bar: 42 };
  </script>
</body>
```

For some time, at the beginning of JavaScript that is how "modules" worked, and you can still see those scripts when using things like Google Analytics,
but lucky us, this implicit work method has passed.

## See also

### JS ecosystem > Foundations 🏗️ > Modules

- [Compatibility Table 📐](./modules-compatibility.md)
- [JavaScript Module Systems Summary 🫀](./summary.md)

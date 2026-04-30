async function setUpPersistence({ queryArg, form, schema }) {
    let url = new URL(window.location);

    let schemaChanged = false;
    for (let i = 0; i < form.elements.length; i++) {
        if (!schema.includes(form.elements[i].name)) {
            schemaChanged = true;
            console.log("new field:", form.elements[i].name);
        }
    }
    if (schemaChanged) {
        window.alert("update the schema!");
        return;
    }

    let data = url.searchParams.get(queryArg);
    if (data != null) {
        data = Uint8Array.fromBase64(data, { alphabet: "base64url" });
        data = new Response(data).body;
        data = data.pipeThrough(new DecompressionStream("deflate-raw"));
        data = await new Response(data).json();
        data.forEach((val, i) => {
            if (form.elements[schema[i]]) {
                form.elements[schema[i]].value = val;
            }
        });
    }

    form.addEventListener("change", async () => {
        schema.forEach((name, i) => {
            data[i] = form.elements[name]?.value ?? "";
        });

        data = new Response(JSON.stringify(data)).body;
        data = data.pipeThrough(new CompressionStream("deflate-raw"));
        data = await new Response(data).bytes();
        data = data.toBase64({ alphabet: "base64url" });

        let newUrl = new URL(url);
        newUrl.searchParams.set(queryArg, data);
        window.history.replaceState(null, "", newUrl);
    });
}
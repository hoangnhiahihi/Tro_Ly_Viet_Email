async function generateEmail() {

    const input = document.getElementById("input").value;

    const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            prompt: input
        })
    });

    const data = await response.json();

    const aiText = data.candidates[0].content.parts[0].text;

    document.getElementById("result").innerText = aiText;

}
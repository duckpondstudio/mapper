

export function DemoUIObject(demoType) {

    switch (demoType.toLowerCase()) {

        case 'gradient':

            const gradientImage = new Image();
            gradientImage.style.height = "100px";
            gradientImage.style.width = "80vw"; // 80% of the page width
            gradientImage.style.display = "block"; // To ensure it takes up space in the layout

            // Create the linear-gradient CSS background property

            let gradient = "linear-gradient(90deg, #00FFEB, #073ABB)";
            // let gradient = "linear-gradient(to right, pink 0%, pink 30%, skyblue 50%, skyblue 100%)";

            gradientImage.style.background = gradient;

            document.body.appendChild(gradientImage);

            break;

    }

}
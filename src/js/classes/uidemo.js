import { GradientCSS } from "../utils/color";


export function DemoUIObject(demoType) {

    switch (demoType.toLowerCase()) {

        case 'gradient':

            const gradientImage = new Image();
            gradientImage.style.height = "100px";
            gradientImage.style.width = "80vw"; // 80% of the page width
            gradientImage.style.display = "block"; // To ensure it takes up space in the layout

            // Create the linear-gradient CSS background property

            gradientImage.style.background = GradientCSS();

            document.body.appendChild(gradientImage);

            break;

    }

}
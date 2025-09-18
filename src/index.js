(function() {
	"use strict";

	const PATTERN_COLORS = [
		{ p1: '#ffd54f', p2: '#ffb300' }
	];

	function createStaticFlower(color, size, rotationDeg = 0, depthZ = 0) {
		const el = document.createElement('div');
		el.className = 'flower';
		el.style.setProperty('--size', `${size}px`);
		const spread = Math.max(8, Math.floor(size * 0.28));
		for (let i = 0; i < 4; i++) {
			const petal = document.createElement('span');
			petal.className = 'petal';
			petal.style.setProperty('--rot', `${rotationDeg + i * 90}deg`);
			petal.style.setProperty('--z', `${depthZ}px`);
			petal.style.setProperty('--spread', `${spread}px`);
			petal.style.setProperty('--p1', '#f8bbd0');
			petal.style.setProperty('--p2', '#f48fb1');
			el.appendChild(petal);
		}
		const center = document.createElement('span');
		center.className = 'center';
		el.appendChild(center);
		return el;
	}

	function initFlowerPattern() {
		const container = document.getElementById('flowers');
		if (!container) return;

		container.innerHTML = '';
		const rect = container.getBoundingClientRect();
		const size = Math.max(36, Math.min(64, Math.round(rect.width / 16)));
		const gap = Math.round(size * 1.6);

		// Create a grid slightly bigger than viewport for smooth parallax
		const cols = Math.ceil(rect.width / gap) + 2;
		const rows = Math.ceil(rect.height / gap) + 2;
		const offsetX = -gap;
		const offsetY = -gap;

		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const color = PATTERN_COLORS[0];
				const rot = (r + c) % 2 === 0 ? 0 : 45;
				const depth = (r % 3) * 6 - 6; // -6, 0, 6 for subtle 3D
				const flower = createStaticFlower(color, size, rot, depth);
				flower.style.left = `${offsetX + c * gap}px`;
				flower.style.top = `${offsetY + r * gap}px`;
				flower.style.setProperty('--spinDur', `${12 + ((r + c) % 5) * 2}s`);
				flower.style.animationDelay = `${((r * cols + c) % 8) * -0.5}s`;
				container.appendChild(flower);
			}
		}
	}

	function initScrollEffects() {
		const container = document.getElementById('flowers');
		const banner = document.getElementById('banner');
		const title = document.querySelector('#banner .title');
		if (!container || !banner || !title) return;

		const maxOffset = 80; // px parallax
		const maxScaleBoost = 0.12; // up to +12% scale
		const maxTranslateY = 26; // px
		const maxLetter = 4; // px letter-spacing increase

		let ticking = false;

		function onScroll() {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(update);
		}

		function update() {
			const rect = banner.getBoundingClientRect();
			const viewH = window.innerHeight || document.documentElement.clientHeight;
			// progress: 0 (top fully visible) -> 1 (banner bottom at top)
			const total = Math.max(1, rect.height + viewH);
			const visibleTop = Math.min(Math.max(0, viewH - rect.top), total);
			const progress = 1 - Math.max(0, Math.min(1, visibleTop / total));

			// Parallax background
			const y = -progress * maxOffset;
			container.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;

			// Title transform
			const scale = 1 + (1 - progress) * maxScaleBoost;
			const ty = progress * maxTranslateY;
			const ls = 2 + (1 - progress) * maxLetter;
			title.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
			title.style.letterSpacing = `${ls.toFixed(1)}px`;

			ticking = false;
		}

		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', () => {
			initFlowerPattern();
			update();
		}, { passive: true });
	}

	function initMap3DScroll() {
		const map = document.getElementById('world-map');
		const container = document.getElementById('map-container');
		if (!map || !container) return;

		let ticking = false;

		function onScroll() {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(update);
		}

		function update() {
			const rect = container.getBoundingClientRect();
			const vh = window.innerHeight || document.documentElement.clientHeight;
			const centerProgress = 1 - Math.min(1, Math.abs(rect.top + rect.height / 2 - vh / 2) / (vh / 2));
			// depth pushes in when centered; tilt subtly follows center position
			const depth = centerProgress * 120; // px translateZ
			const scale = 1 + centerProgress * 0.06;
			const tiltX = ((rect.top + rect.height / 2) - vh / 2) / vh * -6; // deg
			const tiltY = ((rect.left + rect.width / 2) - (window.innerWidth / 2)) / window.innerWidth * 6; // deg
			map.style.transform = `translateZ(${depth.toFixed(1)}px) scale(${scale.toFixed(3)}) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
			ticking = false;
		}

		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', update, { passive: true });
	}

	document.addEventListener('DOMContentLoaded', () => {
		initFlowerPattern();
		initScrollEffects();
		initMap3DScroll();
	});
})();

/// Código para el modelo 3D optimizado con iconos de mariposa
const container = document.getElementById('earth-container');

// Crear la escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Configurar el renderer
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0xd1c4e9); // Color de fondo morado
container.appendChild(renderer.domElement);

// Array para almacenar los iconos de mariposa
let butterflyIcons = [];
let earthModel = null;

// Datos de las mariposas por continente (posiciones 3D en el globo)
const butterflyData = [
    {
        name: "América",
        position: new THREE.Vector3(0.9, 0.1, 0.1),
        url: "https://www.ejemplo-america-norte.com"
    },
    {
        name: "Europa",
        position: new THREE.Vector3(-0.3, 0.3, -0.6),
        url: "https://www.ejemplo-europa.com"
    },
    {
        name: "África",
        position: new THREE.Vector3(-0.3, 0, -0.6),
        url: "https://www.ejemplo-africa.com"
    },
    {
        name: "Asia",
        position: new THREE.Vector3(-0.7, 0.1, 0.3),
        url: "https://www.ejemplo-asia.com"
    },
    {
        name: "Oceanía",
        position: new THREE.Vector3(-0.4, -0.4, 0.3),
        url: "https://www.ejemplo-oceania.com"
    }
];

// Función para crear iconos HTML de mariposa
function createButterflyIcons() {
    butterflyData.forEach((data, index) => {
        // Crear el elemento HTML
        const icon = document.createElement('div');
        icon.className = 'butterfly-icon';
        icon.innerHTML = '🦋';
        icon.style.cssText = `
            position: absolute;
            font-size: 60px;
            cursor: pointer;
            z-index: 100;
            transition: all 0.3s ease;
            user-select: none;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            pointer-events: auto;
        `;
        
        // Añadir título tooltip
        icon.title = data.name;
        
        // Evento click para abrir enlace
        icon.addEventListener('click', () => {
            window.open(data.url, '_blank');
        });
        
        // Efectos hover
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'scale(1.3)';
            icon.style.filter = 'brightness(1.2)';
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'scale(1)';
            icon.style.filter = 'brightness(1)';
        });
        
        // Añadir al container
        container.appendChild(icon);
        
        // Guardar referencia con datos
        butterflyIcons.push({
            element: icon,
            position3D: data.position.clone(),
            data: data
        });
    });
}

// Función para actualizar posiciones de iconos en pantalla
function updateButterflyPositions() {
    butterflyIcons.forEach(butterfly => {
        // Posición original en coordenadas locales de la esfera
        const localPosition = butterfly.position3D.clone();
        
        // Convertir a posición mundial aplicando la transformación del modelo
        const worldPosition = localPosition.clone();
        if (earthModel) {
            worldPosition.applyMatrix4(earthModel.matrixWorld);
        }
        
        // Calcular vector desde el centro de la tierra hacia la cámara
        const earthCenter = new THREE.Vector3(0, 0, 0);
        if (earthModel) {
            earthCenter.setFromMatrixPosition(earthModel.matrixWorld);
        }
        
        const cameraVector = camera.position.clone().sub(earthCenter).normalize();
        
        // Vector desde el centro de la tierra hacia la mariposa
        const butterflyVector = localPosition.clone().normalize();
        
        // Si aplicamos rotación al modelo, también rotamos el vector de la mariposa
        if (earthModel) {
            const rotationMatrix = new THREE.Matrix3().getNormalMatrix(earthModel.matrixWorld);
            butterflyVector.applyMatrix3(rotationMatrix);
        }
        
        // Calcular el producto punto para determinar si está del lado visible
        const dotProduct = butterflyVector.dot(cameraVector);
        
        // Convertir a coordenadas de pantalla para posicionamiento
        const screenPosition = worldPosition.clone();
        screenPosition.project(camera);
        
        // Obtener las dimensiones del contenedor
        const rect = container.getBoundingClientRect();
        
        // Convertir a coordenadas relativas al contenedor
        const x = (screenPosition.x * 0.5 + 0.5) * rect.width;
        const y = (screenPosition.y * -0.5 + 0.5) * rect.height;
        
        // La mariposa es visible si:
        // 1. Está dentro del frustum de la cámara (z < 1)
        // 2. Está en el lado visible de la esfera (dotProduct > 0)
        const isVisible = screenPosition.z < 1 && dotProduct > 0.15; // 0.15 es el umbral
        
        // Actualizar posición y visibilidad del icono
        butterfly.element.style.left = (x - 12) + 'px';
        butterfly.element.style.top = (y - 12) + 'px';
        butterfly.element.style.display = isVisible ? 'block' : 'none';
        
        // Opcional: fade gradual cerca del borde
        if (isVisible && dotProduct < 0.5) {
            const opacity = Math.max(0.4, dotProduct * 2);
            butterfly.element.style.opacity = opacity;
        } else if (isVisible) {
            butterfly.element.style.opacity = 1;
        }
    });
}

// Iluminación optimizada para ver todos los detalles
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Luz principal desde el frente
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);

// Luz desde atrás para iluminar el lado oscuro
const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
backLight.position.set(0, 0, -1);
scene.add(backLight);

// Luces laterales para mejor definición
const sideLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
sideLight1.position.set(1, 0, 0);
scene.add(sideLight1);

const sideLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
sideLight2.position.set(-1, 0, 0);
scene.add(sideLight2);

// Cargar el modelo
const loader = new THREE.GLTFLoader();
loader.load('./assets/Earth_Zoe_XR.glb',
    function (gltf) {
        earthModel = gltf.scene;
        scene.add(earthModel);
        
        // Centrar el modelo
        const box = new THREE.Box3().setFromObject(earthModel);
        const center = box.getCenter(new THREE.Vector3());
        earthModel.position.sub(center);
        earthModel.rotation.y = Math.PI / 1.1;
        
        // Calcular distancia óptima para ver toda la Tierra
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Ajustar cámara para ver toda la esfera perfectamente
        const distance = maxDim / (2 * Math.tan((camera.fov * Math.PI / 180) / 2));
        camera.position.z = distance * 1.2; // 1.2 para dar un poco de margen
        
        // Crear los iconos de mariposa después de cargar el modelo
        createButterflyIcons();
        
        animate();
    },
    function (progress) {
        console.log('Progreso de carga:', (progress.loaded / progress.total * 100) + '%');
    },
    function (error) {
        console.error('Error al cargar el modelo:', error);
    }
);

// Controles de órbita optimizados
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enableRotate = true;
controls.enablePan = true;

// Limitar el zoom para mantener buena vista de continentes
controls.minDistance = 3; // No acercarse demasiado
controls.maxDistance = 3; // No alejarse demasiado

// Función de animación
function animate() {
    requestAnimationFrame(animate);
    
    // Actualizar posiciones de mariposas en cada frame
    updateButterflyPositions();
    
    controls.update();
    renderer.render(scene, camera);
}

// Redimensionar cuando cambie el tamaño de la ventana
window.addEventListener('resize', function() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
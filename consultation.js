document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    const chartContainer = document.getElementById('chart-container');

    window.showForm = function () {
        form.classList.toggle('active');
    };

    // --- Three.js Configuration ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, chartContainer.offsetWidth / chartContainer.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({alpha: true});

    renderer.setSize(chartContainer.offsetWidth, chartContainer.offsetHeight);
    chartContainer.appendChild(renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x3498db, wireframe: true });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    camera.position.z = 50;

    function animate() {
        requestAnimationFrame(animate);
        torusKnot.rotation.x += 0.01;
        torusKnot.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    animate();
    window.addEventListener('resize', () => {
        camera.aspect = chartContainer.offsetWidth / chartContainer.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(chartContainer.offsetWidth, chartContainer.offsetHeight);
    });
});
document.addEventListener("DOMContentLoaded", function () {
  // استهداف العناصر
  var openModalBtn = document.getElementById("openConsultationForm");
  var modal = document.getElementById("consultationModal");
  var closeModal = document.querySelector(".close");

  // التأكد من أن النافذة غير ظاهرة عند بدء التشغيل
  modal.style.display = "none";

  // فتح النافذة عند الضغط على زر الحجز
  openModalBtn.addEventListener("click", function () {
    modal.style.display = "flex";
  });

  // إغلاق النافذة عند الضغط على زر الإغلاق
  closeModal.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // إغلاق النافذة عند النقر خارج المحتوى
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});
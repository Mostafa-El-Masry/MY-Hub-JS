
const videoLibrary = [
            {
                id: 1,
                title: "Sample Video 1",
                description: "This is a sample video description. Replace with your actual video details.",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
                duration: "10:34",
                size: "15.3 MB",
                category: "Animation"
            },
            {
                id: 2,
                title: "Sample Video 2", 
                description: "Another sample video for demonstration purposes.",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
                duration: "5:20",
                size: "8.7 MB",
                category: "Drama"
            },
            {
                id: 3,
                title: "Sample Video 3",
                description: "A third sample video to showcase the library functionality.",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
                duration: "7:45",
                size: "12.1 MB", 
                category: "Action"
            }
        ];

        // State management
        let currentView = 'grid';
        let filteredVideos = [...videoLibrary];

        // DOM elements
        const videoContainer = document.getElementById('videoContainer');
        const searchInput = document.getElementById('searchInput');
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        const videoModal = document.getElementById('videoModal');
        const modalVideo = document.getElementById('modalVideo');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalDuration = document.getElementById('modalDuration');
        const modalSize = document.getElementById('modalSize');
        const closeModal = document.getElementById('closeModal');
        const totalVideos = document.getElementById('totalVideos');
        const visibleVideos = document.getElementById('visibleVideos');
        const noResults = document.getElementById('noResults');

        // Dark mode detection
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });

        // Initialize the library
        function initializeLibrary() {
            updateStats();
            renderVideos();
            setupEventListeners();
        }

        // Update statistics
        function updateStats() {
            totalVideos.textContent = videoLibrary.length;
            visibleVideos.textContent = filteredVideos.length;
        }

        // Render videos in the container
        function renderVideos() {
            videoContainer.innerHTML = '';
            
            if (filteredVideos.length === 0) {
                noResults.classList.remove('hidden');
                return;
            }
            
            noResults.classList.add('hidden');
            
            filteredVideos.forEach(video => {
                const videoCard = createVideoCard(video);
                videoContainer.appendChild(videoCard);
            });
        }

        // Create a video card element
        function createVideoCard(video) {
            const card = document.createElement('div');
            card.className = `video-card bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${currentView === 'list' ? 'flex' : ''}`;
            
            card.innerHTML = `
                ${currentView === 'grid' ? `
                    <div class="relative">
                        <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail w-full">
                        <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <i class="fas fa-play text-white text-3xl opacity-0 hover:opacity-100 transition-opacity duration-300"></i>
                        </div>
                        <div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                            ${video.duration}
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="font-semibold text-lg mb-2 text-gray-900 dark:text-white truncate">${video.title}</h3>
                        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">${video.description}</p>
                        <div class="flex justify-between items-center">
                            <span class="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded text-xs">${video.category}</span>
                            <span class="text-gray-500 dark:text-gray-400 text-xs">${video.size}</span>
                        </div>
                    </div>
                ` : `
                    <div class="w-32 h-20 flex-shrink-0">
                        <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-full object-cover rounded-l-lg">
                    </div>
                    <div class="flex-1 p-4 flex flex-col justify-between">
                        <div>
                            <h3 class="font-semibold text-lg mb-1 text-gray-900 dark:text-white">${video.title}</h3>
                            <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">${video.description}</p>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                            <span class="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded">${video.category}</span>
                            <div class="flex space-x-3 text-gray-500 dark:text-gray-400">
                                <span>${video.duration}</span>
                                <span>${video.size}</span>
                            </div>
                        </div>
                    </div>
                `}
            `;
            
            card.addEventListener('click', () => openVideoModal(video));
            return card;
        }

        // Open video in modal
        function openVideoModal(video) {
            modalTitle.textContent = video.title;
            modalDescription.textContent = video.description;
            modalDuration.textContent = `Duration: ${video.duration}`;
            modalSize.textContent = `Size: ${video.size}`;
            modalVideo.src = video.url;
            videoModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        // Close video modal
        function closeVideoModal() {
            videoModal.classList.add('hidden');
            modalVideo.pause();
            modalVideo.src = '';
            document.body.style.overflow = 'auto';
        }

        // Filter videos based on search
        function filterVideos(searchTerm) {
            filteredVideos = videoLibrary.filter(video => 
                video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                video.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
            updateStats();
            renderVideos();
        }

        // Switch between grid and list view
        function switchView(view) {
            currentView = view;
            
            if (view === 'grid') {
                videoContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
                gridViewBtn.className = 'p-2 rounded-lg bg-primary text-white';
                listViewBtn.className = 'p-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300';
            } else {
                videoContainer.className = 'space-y-4';
                listViewBtn.className = 'p-2 rounded-lg bg-primary text-white';
                gridViewBtn.className = 'p-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300';
            }
            
            renderVideos();
        }

        // Setup event listeners
        function setupEventListeners() {
            searchInput.addEventListener('input', (e) => {
                filterVideos(e.target.value);
            });

            gridViewBtn.addEventListener('click', () => switchView('grid'));
            listViewBtn.addEventListener('click', () => switchView('list'));

            closeModal.addEventListener('click', closeVideoModal);
            
            videoModal.addEventListener('click', (e) => {
                if (e.target === videoModal) {
                    closeVideoModal();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeVideoModal();
                }
            });
        }

        // Initialize the application
        initializeLibrary();

        // Console log for easy array replacement
        console.log('To use your own videos, replace the videoLibrary array at the top of the script with your video data.');
        console.log('Required format: { id, title, description, url, thumbnail, duration, size, category }');
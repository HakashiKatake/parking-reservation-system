/**
 * PRIORITY QUEUE ALGORITHM FOR PARKING RESERVATION SYSTEM
 * =====================================================
 * 
 * This algorithm implements a simple priority queue system for parking reservations
 * where premium users get higher priority than free users.
 * 
 * CONCEPT:
 * - Priority Queue: A data structure where elements are served based on their priority
 * - Higher priority = served first
 * - Same priority = First-In-First-Out (FIFO)
 * 
 * USE CASE:
 * When multiple users try to book the same parking slot simultaneously,
 * premium users should get preference over free users.
 * 
 * ALGORITHM COMPLEXITY:
 * - Insert: O(log n) - logarithmic time
 * - Extract Max: O(log n) - logarithmic time
 * - Peek: O(1) - constant time
 */

class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    /**
     * INSERT OPERATION
     * ================
     * Adds a new booking request to the queue with priority
     * 
     * @param {Object} booking - Booking request object
     * @param {string} booking.userId - User ID
     * @param {string} booking.userType - 'premium' or 'free'
     * @param {Date} booking.timestamp - When request was made
     * @param {Object} booking.details - Booking details
     */
    insert(booking) {
        // Calculate priority score
        const priority = this.calculatePriority(booking);
        
        // Create queue item with priority
        const item = {
            ...booking,
            priority: priority,
            insertTime: Date.now()
        };
        
        // Add to heap and bubble up
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
        
        console.log(`🚗 Added booking request: User ${booking.userId} (${booking.userType}) - Priority: ${priority}`);
    }

    /**
     * EXTRACT MAXIMUM PRIORITY OPERATION
     * ==================================
     * Removes and returns the highest priority booking request
     * 
     * @returns {Object|null} - Highest priority booking or null if empty
     */
    extractMax() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        // Get max element (root)
        const max = this.heap[0];
        
        // Move last element to root and bubble down
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        
        console.log(`✅ Processing booking: User ${max.userId} (${max.userType}) - Priority: ${max.priority}`);
        return max;
    }

    /**
     * PRIORITY CALCULATION ALGORITHM
     * ==============================
     * Simple scoring system for priority:
     * 
     * BASE SCORES:
     * - Premium User: 1000 points
     * - Free User: 100 points
     * 
     * TIME BONUS:
     * - Earlier requests get slight bonus (max 50 points)
     * 
     * TOTAL PRIORITY = BASE_SCORE + TIME_BONUS
     */
    calculatePriority(booking) {
        let priority = 0;
        
        // 1. User Type Priority (Main Factor)
        switch (booking.userType) {
            case 'premium':
                priority += 1000; // Premium users get 10x priority
                break;
            case 'free':
            default:
                priority += 100; // Base priority for free users
                break;
        }
        
        // 2. Time-based Priority (Secondary Factor)
        // Earlier requests get slight advantage within same user type
        const now = Date.now();
        const requestTime = new Date(booking.timestamp).getTime();
        const timeDiff = now - requestTime;
        
        // Newer requests (smaller timeDiff) get higher time bonus
        const timeBonus = Math.max(0, 50 - Math.floor(timeDiff / 1000));
        priority += timeBonus;
        
        // 3. Booking Value Priority (Tertiary Factor)
        // Higher value bookings get slight preference
        const valueBonus = Math.min(10, Math.floor((booking.details?.totalAmount || 0) / 10));
        priority += valueBonus;
        
        return priority;
    }

    /**
     * HEAP OPERATIONS
     * ===============
     * Standard binary heap operations for maintaining priority order
     */
    
    // Move element up until heap property is satisfied
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            
            // If parent has higher priority, stop
            if (this.heap[parentIndex].priority >= this.heap[index].priority) {
                break;
            }
            
            // Swap with parent
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }
    
    // Move element down until heap property is satisfied
    bubbleDown(index) {
        while (true) {
            let maxIndex = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            
            // Check if left child has higher priority
            if (leftChild < this.heap.length && 
                this.heap[leftChild].priority > this.heap[maxIndex].priority) {
                maxIndex = leftChild;
            }
            
            // Check if right child has higher priority
            if (rightChild < this.heap.length && 
                this.heap[rightChild].priority > this.heap[maxIndex].priority) {
                maxIndex = rightChild;
            }
            
            // If no child has higher priority, stop
            if (maxIndex === index) {
                break;
            }
            
            // Swap with child with higher priority
            this.swap(index, maxIndex);
            index = maxIndex;
        }
    }
    
    // Utility function to swap two elements
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    /**
     * UTILITY METHODS
     * ===============
     */
    
    // Check if queue is empty
    isEmpty() {
        return this.heap.length === 0;
    }
    
    // Get size of queue
    size() {
        return this.heap.length;
    }
    
    // Peek at highest priority without removing
    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }
    
    // Get all items sorted by priority (for display)
    getAllSorted() {
        return [...this.heap].sort((a, b) => b.priority - a.priority);
    }
    
    // Clear all items
    clear() {
        this.heap = [];
    }
}

/**
 * BOOKING PRIORITY SERVICE
 * ========================
 * Service class that integrates priority queue with booking system
 */
class BookingPriorityService {
    constructor() {
        this.queues = new Map(); // One queue per parking lot
    }
    
    /**
     * Add booking request to priority queue
     */
    addBookingRequest(parkingLotId, booking) {
        if (!this.queues.has(parkingLotId)) {
            this.queues.set(parkingLotId, new PriorityQueue());
        }
        
        const queue = this.queues.get(parkingLotId);
        queue.insert(booking);
        
        return {
            position: queue.size(),
            estimatedWaitTime: this.calculateWaitTime(queue, booking)
        };
    }
    
    /**
     * Process next booking request
     */
    processNextBooking(parkingLotId) {
        const queue = this.queues.get(parkingLotId);
        if (!queue || queue.isEmpty()) {
            return null;
        }
        
        return queue.extractMax();
    }
    
    /**
     * Get queue status for a parking lot
     */
    getQueueStatus(parkingLotId) {
        const queue = this.queues.get(parkingLotId);
        if (!queue) {
            return { size: 0, items: [] };
        }
        
        return {
            size: queue.size(),
            items: queue.getAllSorted().map(item => ({
                userId: item.userId,
                userType: item.userType,
                priority: item.priority,
                waitTime: this.calculateWaitTime(queue, item)
            }))
        };
    }
    
    /**
     * Calculate estimated wait time
     */
    calculateWaitTime(queue, booking) {
        const position = queue.getAllSorted().findIndex(item => 
            item.userId === booking.userId && 
            item.insertTime === booking.insertTime
        );
        
        // Assume 2 minutes per booking ahead
        return (position + 1) * 2;
    }
}

/**
 * EXAMPLE USAGE AND DEMONSTRATION
 * ===============================
 */
function demonstratePriorityQueue() {
    console.log("\n🚀 PARKING PRIORITY QUEUE DEMONSTRATION");
    console.log("=====================================\n");
    
    const service = new BookingPriorityService();
    const parkingLotId = "lot-001";
    
    // Simulate booking requests
    const bookings = [
        {
            userId: "user-001",
            userType: "free",
            timestamp: new Date(Date.now() - 5000), // 5 seconds ago
            details: { totalAmount: 100, duration: 2 }
        },
        {
            userId: "user-002",
            userType: "premium",
            timestamp: new Date(Date.now() - 3000), // 3 seconds ago
            details: { totalAmount: 150, duration: 3 }
        },
        {
            userId: "user-003",
            userType: "free",
            timestamp: new Date(Date.now() - 1000), // 1 second ago
            details: { totalAmount: 80, duration: 1 }
        },
        {
            userId: "user-004",
            userType: "premium",
            timestamp: new Date(), // Just now
            details: { totalAmount: 200, duration: 4 }
        }
    ];
    
    // Add all bookings
    console.log("📝 Adding booking requests...\n");
    bookings.forEach(booking => {
        const result = service.addBookingRequest(parkingLotId, booking);
        console.log(`   Position in queue: ${result.position}, Wait time: ${result.estimatedWaitTime} minutes\n`);
    });
    
    // Show queue status
    console.log("📊 Current Queue Status:");
    const status = service.getQueueStatus(parkingLotId);
    status.items.forEach((item, index) => {
        console.log(`   ${index + 1}. User ${item.userId} (${item.userType}) - Priority: ${item.priority}`);
    });
    
    // Process bookings
    console.log("\n🔄 Processing bookings in priority order...\n");
    while (true) {
        const nextBooking = service.processNextBooking(parkingLotId);
        if (!nextBooking) break;
        console.log(`   Processed: ${nextBooking.userId} (${nextBooking.userType})`);
    }
    
    console.log("\n✅ All bookings processed!\n");
}

// Export classes and functions
export { PriorityQueue, BookingPriorityService, demonstratePriorityQueue };
export default PriorityQueue;
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

   
    insert(booking) {
        
        const priority = this.calculatePriority(booking);
        
        
        const item = {
            ...booking,
            priority: priority,
            insertTime: Date.now()
        };
        
       
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
        
        console.log(`🚗 Added booking request: User ${booking.userId} (${booking.userType}) - Priority: ${priority}`);
    }

    
    extractMax() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

       
        const max = this.heap[0];
        
        
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        
        console.log(`✅ Processing booking: User ${max.userId} (${max.userType}) - Priority: ${max.priority}`);
        return max;
    }

    
    calculatePriority(booking) {
        let priority = 0;
        
        
        switch (booking.userType) {
            case 'premium':
                priority += 1000; 
                break;
            case 'free':
            default:
                priority += 100; 
                break;
        }
        
       
        const now = Date.now();
        const requestTime = new Date(booking.timestamp).getTime();
        const timeDiff = now - requestTime;
        
        
        const timeBonus = Math.max(0, 50 - Math.floor(timeDiff / 1000));
        priority += timeBonus;
        
        
        const valueBonus = Math.min(10, Math.floor((booking.details?.totalAmount || 0) / 10));
        priority += valueBonus;
        
        return priority;
    }

   
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            
           
            if (this.heap[parentIndex].priority >= this.heap[index].priority) {
                break;
            }
            
           
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }
    
    
    bubbleDown(index) {
        while (true) {
            let maxIndex = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            
            
            if (leftChild < this.heap.length && 
                this.heap[leftChild].priority > this.heap[maxIndex].priority) {
                maxIndex = leftChild;
            }
            
            
            if (rightChild < this.heap.length && 
                this.heap[rightChild].priority > this.heap[maxIndex].priority) {
                maxIndex = rightChild;
            }
            
            
            if (maxIndex === index) {
                break;
            }
            
            
            this.swap(index, maxIndex);
            index = maxIndex;
        }
    }
    
   
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    
    isEmpty() {
        return this.heap.length === 0;
    }
    
  
    size() {
        return this.heap.length;
    }
    
    
    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }
    

    getAllSorted() {
        return [...this.heap].sort((a, b) => b.priority - a.priority);
    }
    

    clear() {
        this.heap = [];
    }
}


class BookingPriorityService {
    constructor() {
        this.queues = new Map(); 
    }
    
   
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
    
   
    processNextBooking(parkingLotId) {
        const queue = this.queues.get(parkingLotId);
        if (!queue || queue.isEmpty()) {
            return null;
        }
        
        return queue.extractMax();
    }
    
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
    
    
    calculateWaitTime(queue, booking) {
        const position = queue.getAllSorted().findIndex(item => 
            item.userId === booking.userId && 
            item.insertTime === booking.insertTime
        );
        
        
        return (position + 1) * 2;
    }
}


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

demonstratePriorityQueue();

// Export classes and functions
export { PriorityQueue, BookingPriorityService, demonstratePriorityQueue };
export default PriorityQueue;
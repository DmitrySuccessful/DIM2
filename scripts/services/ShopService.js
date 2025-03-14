import { GAME_CONFIG } from '../gameConfig.js';

export class ShopService {
    constructor() {
        this.money = GAME_CONFIG.shop.startingMoney;
        this.reputation = GAME_CONFIG.shop.startingReputation;
        this.staff = [];
        this.inventory = new Map();
        this.activeMarketing = [];
        this.competitors = [];
        this.customerReviews = [];
        this.eventListeners = new Map();
    }

    // Staff Management
    hireStaff(type, name) {
        const staffConfig = GAME_CONFIG.shop.staffTypes[type];
        if (!staffConfig) throw new Error('Invalid staff type');
        
        const staff = {
            id: Date.now(),
            type,
            name,
            salary: staffConfig.baseSalary,
            efficiency: staffConfig.efficiency,
            experience: 0,
            hired: new Date()
        };
        
        this.staff.push(staff);
        this.emit('staffHired', staff);
        return staff;
    }

    fireStaff(staffId) {
        const index = this.staff.findIndex(s => s.id === staffId);
        if (index === -1) throw new Error('Staff member not found');
        
        const staff = this.staff[index];
        this.staff.splice(index, 1);
        this.emit('staffFired', staff);
    }

    // Inventory Management
    addInventory(item, quantity, cost) {
        const existing = this.inventory.get(item.id) || { quantity: 0, totalCost: 0 };
        this.inventory.set(item.id, {
            ...item,
            quantity: existing.quantity + quantity,
            totalCost: existing.totalCost + (cost * quantity)
        });
        this.emit('inventoryUpdated', { item, quantity, cost });
    }

    sellItem(itemId, quantity, price) {
        const item = this.inventory.get(itemId);
        if (!item || item.quantity < quantity) {
            throw new Error('Insufficient inventory');
        }

        const revenue = price * quantity;
        this.money += revenue;
        
        item.quantity -= quantity;
        if (item.quantity === 0) {
            this.inventory.delete(itemId);
        } else {
            this.inventory.set(itemId, item);
        }

        this.emit('itemSold', { itemId, quantity, revenue });
        return revenue;
    }

    // Marketing Campaigns
    startMarketingCampaign(channel, budget) {
        const channelConfig = GAME_CONFIG.shop.marketingChannels[channel];
        if (!channelConfig) throw new Error('Invalid marketing channel');
        if (budget < channelConfig.baseCost) throw new Error('Insufficient budget');

        const campaign = {
            id: Date.now(),
            channel,
            budget,
            efficiency: channelConfig.efficiency,
            startDate: new Date(),
            duration: channelConfig.duration,
            active: true
        };

        this.activeMarketing.push(campaign);
        this.money -= budget;
        this.emit('marketingStarted', campaign);
        
        // Schedule campaign end
        setTimeout(() => this.endMarketingCampaign(campaign.id), 
            channelConfig.duration * 24 * 60 * 60 * 1000);
        
        return campaign;
    }

    endMarketingCampaign(campaignId) {
        const index = this.activeMarketing.findIndex(c => c.id === campaignId);
        if (index === -1) return;

        const campaign = this.activeMarketing[index];
        campaign.active = false;
        this.activeMarketing.splice(index, 1);
        this.emit('marketingEnded', campaign);
    }

    // Customer Reviews
    addCustomerReview(rating, comment) {
        const review = {
            id: Date.now(),
            rating,
            comment,
            date: new Date()
        };

        this.customerReviews.push(review);
        this.updateReputation(rating);
        this.emit('reviewAdded', review);
        return review;
    }

    updateReputation(rating) {
        const change = (rating - 3) * 2; // -4 to +4 reputation change
        this.reputation = Math.max(0, Math.min(
            GAME_CONFIG.shop.maxReputation,
            this.reputation + change
        ));
        this.emit('reputationChanged', this.reputation);
    }

    // Event System
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }

    off(event, callback) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.delete(callback);
        }
    }

    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            for (const callback of listeners) {
                callback(data);
            }
        }
    }

    // Game State
    save() {
        const state = {
            money: this.money,
            reputation: this.reputation,
            staff: this.staff,
            inventory: Array.from(this.inventory.entries()),
            activeMarketing: this.activeMarketing,
            customerReviews: this.customerReviews
        };
        localStorage.setItem('shopState', JSON.stringify(state));
    }

    load() {
        const saved = localStorage.getItem('shopState');
        if (!saved) return;

        const state = JSON.parse(saved);
        this.money = state.money;
        this.reputation = state.reputation;
        this.staff = state.staff;
        this.inventory = new Map(state.inventory);
        this.activeMarketing = state.activeMarketing;
        this.customerReviews = state.customerReviews;
        
        this.emit('stateLoaded', state);
    }
} 
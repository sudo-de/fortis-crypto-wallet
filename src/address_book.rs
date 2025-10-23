use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use crate::error::WalletError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AddressEntry {
    pub name: String,
    pub address: String,
    pub label: Option<String>,
    pub created_at: DateTime<Utc>,
    pub last_used: Option<DateTime<Utc>>,
    pub use_count: u32,
    pub is_favorite: bool,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddressBook {
    entries: HashMap<String, AddressEntry>,
    favorites: Vec<String>, // Address names
}

impl AddressBook {
    pub fn new() -> Self {
        Self {
            entries: HashMap::new(),
            favorites: Vec::new(),
        }
    }
    
    pub fn add_address(
        &mut self,
        name: String,
        address: String,
        label: Option<String>,
        notes: Option<String>,
    ) -> Result<(), WalletError> {
        if self.entries.contains_key(&name) {
            return Err(WalletError::Storage(format!("Address '{}' already exists", name)));
        }
        
        if !self.is_valid_address(&address) {
            return Err(WalletError::InvalidAddress(format!("Invalid address format: {}", address)));
        }
        
        let entry = AddressEntry {
            name: name.clone(),
            address,
            label,
            created_at: Utc::now(),
            last_used: None,
            use_count: 0,
            is_favorite: false,
            notes,
        };
        
        self.entries.insert(name, entry);
        Ok(())
    }
    
    pub fn remove_address(&mut self, name: &str) -> Result<(), WalletError> {
        if let Some(entry) = self.entries.remove(name) {
            if entry.is_favorite {
                self.favorites.retain(|f| f != name);
            }
            Ok(())
        } else {
            Err(WalletError::Storage(format!("Address '{}' not found", name)))
        }
    }
    
    pub fn get_address(&self, name: &str) -> Option<&AddressEntry> {
        self.entries.get(name)
    }
    
    pub fn get_address_by_address(&self, address: &str) -> Option<&AddressEntry> {
        self.entries.values().find(|entry| entry.address == address)
    }
    
    pub fn list_addresses(&self) -> Vec<&AddressEntry> {
        self.entries.values().collect()
    }
    
    pub fn search_addresses(&self, query: &str) -> Vec<&AddressEntry> {
        let query_lower = query.to_lowercase();
        self.entries.values()
            .filter(|entry| {
                entry.name.to_lowercase().contains(&query_lower) ||
                entry.address.to_lowercase().contains(&query_lower) ||
                entry.label.as_ref().map_or(false, |l| l.to_lowercase().contains(&query_lower)) ||
                entry.notes.as_ref().map_or(false, |n| n.to_lowercase().contains(&query_lower))
            })
            .collect()
    }
    
    pub fn mark_as_used(&mut self, name: &str) -> Result<(), WalletError> {
        if let Some(entry) = self.entries.get_mut(name) {
            entry.last_used = Some(Utc::now());
            entry.use_count += 1;
            Ok(())
        } else {
            Err(WalletError::Storage(format!("Address '{}' not found", name)))
        }
    }
    
    pub fn toggle_favorite(&mut self, name: &str) -> Result<bool, WalletError> {
        if let Some(entry) = self.entries.get_mut(name) {
            entry.is_favorite = !entry.is_favorite;
            
            if entry.is_favorite {
                if !self.favorites.contains(&name.to_string()) {
                    self.favorites.push(name.to_string());
                }
            } else {
                self.favorites.retain(|f| f != name);
            }
            
            Ok(entry.is_favorite)
        } else {
            Err(WalletError::Storage(format!("Address '{}' not found", name)))
        }
    }
    
    pub fn get_favorites(&self) -> Vec<&AddressEntry> {
        self.favorites.iter()
            .filter_map(|name| self.entries.get(name))
            .collect()
    }
    
    pub fn get_frequently_used(&self, limit: usize) -> Vec<&AddressEntry> {
        let mut entries: Vec<&AddressEntry> = self.entries.values().collect();
        entries.sort_by(|a, b| b.use_count.cmp(&a.use_count));
        entries.into_iter().take(limit).collect()
    }
    
    pub fn get_recently_used(&self, limit: usize) -> Vec<&AddressEntry> {
        let mut entries: Vec<&AddressEntry> = self.entries.values()
            .filter(|entry| entry.last_used.is_some())
            .collect();
        entries.sort_by(|a, b| b.last_used.cmp(&a.last_used));
        entries.into_iter().take(limit).collect()
    }
    
    pub fn update_entry(
        &mut self,
        name: &str,
        new_name: Option<String>,
        new_address: Option<String>,
        new_label: Option<String>,
        new_notes: Option<String>,
    ) -> Result<(), WalletError> {
        if let Some(entry) = self.entries.get_mut(name) {
            if let Some(new_name) = new_name {
                if new_name != name && self.entries.contains_key(&new_name) {
                    return Err(WalletError::Storage(format!("Address '{}' already exists", new_name)));
                }
                entry.name = new_name.clone();
                // Update favorites list if needed
                if let Some(pos) = self.favorites.iter().position(|f| f == name) {
                    self.favorites[pos] = new_name;
                }
            }
            
            if let Some(new_address) = new_address {
                if !self.is_valid_address(&new_address) {
                    return Err(WalletError::InvalidAddress(format!("Invalid address format: {}", new_address)));
                }
                entry.address = new_address;
            }
            
            if let Some(new_label) = new_label {
                entry.label = Some(new_label);
            }
            
            if let Some(new_notes) = new_notes {
                entry.notes = Some(new_notes);
            }
            
            Ok(())
        } else {
            Err(WalletError::Storage(format!("Address '{}' not found", name)))
        }
    }
    
    fn is_valid_address(&self, address: &str) -> bool {
        // Basic Bitcoin address validation
        if address.len() < 26 || address.len() > 35 {
            return false;
        }
        
        // Check if it's base58 encoded
        match base58::FromBase58::from_base58(address) {
            Ok(_) => true,
            Err(_) => false,
        }
    }
    
    pub fn export_to_csv(&self) -> String {
        let mut csv = String::from("Name,Address,Label,Notes,Created,Last Used,Use Count,Is Favorite\n");
        
        for entry in self.entries.values() {
            csv.push_str(&format!(
                "{},{},{},{},{},{},{},{}\n",
                entry.name,
                entry.address,
                entry.label.as_deref().unwrap_or(""),
                entry.notes.as_deref().unwrap_or(""),
                entry.created_at.format("%Y-%m-%d %H:%M:%S UTC"),
                entry.last_used.map_or("Never".to_string(), |dt| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string()),
                entry.use_count,
                entry.is_favorite
            ));
        }
        
        csv
    }
}

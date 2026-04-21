# Security Specification for Enzo Assets

## Data Invariants
1. A User profile can only be created/edited by the owner (uid match).
2. Roles (admin, creator) cannot be self-assigned by standard users.
3. Creator Applications can only be created by signed-in users for themselves.
4. Only Admins can approve or reject Creator Applications.
5. Only Creators can create Products.
6. A Product's creatorId must match the authenticated user's uid.
7. Products can be read by everyone (public marketplace).

## "Dirty Dozen" Payloads (Denial Expected)
1. **Identity Spoofing**: User A trying to update User B's profile.
2. **Privilege Escalation**: User trying to set `role: 'admin'` in their profile.
3. **Ghost Application**: User A submitting a creator application for User B.
4. **State Shortcutting**: User trying to set their application status to `approved`.
5. **Orphaned Product**: Creating a product without a valid category.
6. **Malicious ID**: Using a 2KB string as a document ID.
7. **Bypass Role**: Standard user trying to create a product.
8. **Shadow Field**: Adding `isVerified: true` to a user profile update.
9. **Fake Creator**: Product creatorId mismatch with auth.uid.
10. **Price Manipulation**: Negative price for a product.
11. **Admin Impersonation**: Attempting to read all applications without admin role.
12. **Unauthorized Deletion**: User trying to delete someone else's product.

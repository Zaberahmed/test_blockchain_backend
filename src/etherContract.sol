// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Shipping {
    struct Shipment {
        string userId;
        string userName;
        string shipmentServiceCode;
        string carrierName;
        string createdAt;
        string seelectedRate;
        string status;
        uint256 id;
    }

    address owner;

    mapping(uint256 => Shipment) public shipments; // like: shipments[] (list of shipment)
    uint256 public numberOfShipments = 0;

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    } 

    constructor() {
        owner = msg.sender;
    }

    function createShipment(
        string memory _userId,
        string memory _userName,
        string memory _shipmentServiceCode,
        string memory _carrierName,
        string memory _createdAt,
        string memory _seelectedRate,
        string memory _status
    ) public onlyOwner returns (uint256) {
        // onlyOwner can add data
        Shipment storage shipment = shipments[numberOfShipments];

        shipment.userId = _userId;
        shipment.userName = _userName;
        shipment.shipmentServiceCode = _shipmentServiceCode;
        shipment.carrierName = _carrierName;
        shipment.createdAt = _createdAt;
        shipment.seelectedRate = _seelectedRate;
        shipment.status = _status;
        shipment.id = numberOfShipments;
        
        numberOfShipments++;

        return numberOfShipments - 1;
    }

    function shipmentList() public view returns (Shipment[] memory) {
        // Require that there is at least one shipment
        require(numberOfShipments > 0, "No shipments available");

        Shipment[] memory allShipment = new Shipment[](numberOfShipments);
        for (uint i = 0; i < numberOfShipments; i++) {
            Shipment storage item = shipments[i];
            allShipment[i] = item;
        }

        return allShipment;
    }

    function userShipment(uint256 _id) public view returns (Shipment memory) {
        // Require that the specified shipment exists
        require(_id < numberOfShipments, "Shipment does not exist");

        Shipment storage currShipment = shipments[_id];
        return currShipment;
    }

    function updateShipmentStatus(
        uint256 _id,
        string memory _status
    ) public returns (Shipment memory) {
        // Require that the specified shipment exists
        require(_id < numberOfShipments, "Shipment does not exist");

        Shipment storage currShipment = shipments[_id];
        currShipment.status = _status;

        return currShipment;
    }
}

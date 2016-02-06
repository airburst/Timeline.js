var bedData = {
    homes: [
        {
            name: 'Test Home',
            beds: [
                {
                    id: 'b001',
                    name: 'bed1',
                    bookings: [
                        {
                            ref: 'b01',
                            status: 'booked',
                            client: 'Mark Fairhurst',
                            start: '07/02/2016',
                            duration: 999
                        }
                    ]
                },
                {
                    id: 'b002',
                    name: 'bed2',
                    bookings: [
                        {
                            ref: 'b02',
                            status: 'requested',
                            client: 'John Doe',
                            start: '10/02/2016',
                            duration: 4
                        },
                        {
                            ref: 'b04',
                            status: 'in-use',
                            client: 'IN USE',
                            start: '24/02/2016',
                            duration: 5
                        }
                    ]
                },
                {
                    id: 'b003',
                    name: 'bed3',
                    bookings: []
                }
            ]
            
        },
        {
            name: 'Ashwood Home',
            beds: [
                {
                    id: 'b004',
                    name: 'bed1',
                    bookings: []
                }
            ]
        },
        {
            name: 'Another Home',
            beds: [
                {
                    id: 'b005',
                    name: 'bed1',
                    bookings: []
                },
                {
                    id: 'b006',
                    name: 'bed2',
                    bookings: []
                },
                {
                    id: 'b007',
                    name: 'bed2',
                    bookings: []
                }
            ]
        },
    ]
};
